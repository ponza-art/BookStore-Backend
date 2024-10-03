const express = require("express");
const bodyParser = require("body-parser");
const Stripe = require("stripe");
const Cart = require("../models/cartSchema");
const Order = require("../models/orderSchema");
const stripe = Stripe(process.env.STRIPE_KEY);
require("dotenv").config();

let endpointSecret;
endpointSecret = "whsec_xsYAPw8Ak4f5y0BaNkyc4uCOK6Quxfg9"; // Replace with your actual endpoint secret

// Middleware setup for Stripe webhook raw body parsing
const app = express();
app.use(express.json()); // Use this for other routes
app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }), // Ensure raw body is used for Stripe webhooks
  webhook
);

// Function to create a checkout session
const createCheckoutSession = async (req, res, next) => {
  try {
    const userId = req.body.userId;
    const cart = await Cart.findOne({ userId }).populate(
      "items.bookId",
      "title price"
    );

    if (!cart || cart.items.length === 0) {
      return next(new AppError("Cart is empty", 400));
    }

    // Create a new Stripe customer with metadata
    const customer = await stripe.customers.create({
      metadata: {
        userId: req.body.userId,
        cartId: cart._id.toString(),
      },
    });

    // Prepare line items for the checkout session
    const line_items = req.body.cartData.map((item) => {
      return {
        price_data: {
          currency: "EGP",
          product_data: {
            name: item.title,
            images: [item.coverImage],
            description: item.author,
            metadata: {
              id: item._id,
            },
          },
          unit_amount: Math.ceil(item.price * 1000),
        },
        quantity: 1,
      };
    });

    // Create the Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      line_items,
      customer: customer.id,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/checkout-success`,
      cancel_url: `${process.env.CLIENT_URL}/checkout-cancel`,
    });

    res.status(201).json({ url: session.url });
  } catch (err) {
    next(err);
  }
};

// Function to create an order after checkout completion
const createOrder = async (customer, data) => {
  try {
    const cartId = customer.metadata.cartId;
    const cart = await Cart.findById(cartId);

    if (!cart) {
      console.log("Cart not found");
      return;
    }

    const books = cart.items.map((item) => ({
      bookId: item.bookId._id,
      title: item.bookId.title,
      price: item.bookId.price,
      coverImage: item.bookId.coverImage,
      description: item.bookId.description,
      sourcePath: item.bookId.sourcePath,
    }));

    // Create new order
    const newOrder = new Order({
      userId: customer.metadata.userId,
      cartId: customer.metadata.cartId,
      books,
      totalAmount: data.amount_total,
    });

    await newOrder.save();

    // Clear cart items after successful order creation
    cart.items = [];
    await cart.save();
  } catch (error) {
    console.log("Error in createOrder:", error.message);
  }
};

// Webhook function to handle Stripe events
const webhook = async (req, res, next) => {
  let data;
  let eventType;

  // Check for webhook secret and validate signature
  const signature = req.headers["stripe-signature"];
  let event;

  try {
    // Use raw body for signature validation
    event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);

    data = event.data.object;
    eventType = event.type;
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle event type
  if (eventType === "checkout.session.completed") {
    stripe.customers
      .retrieve(data.customer)
      .then((customer) => {
        createOrder(customer, data);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  res.status(200).end(); // Send success response to Stripe
};

module.exports = { webhook, createOrder, createCheckoutSession };
