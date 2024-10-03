const Stripe = require("stripe");
const Cart = require("../models/cartSchema");
const Order = require("../models/orderSchema");
const stripe = Stripe(process.env.STRIPE_KEY);
require("dotenv").config();
let endpointSecret;
endpointSecret = "whsec_xsYAPw8Ak4f5y0BaNkyc4uCOK6Quxfg9";
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

    const customer = await stripe.customers.create({
      metadata: {
        userId: req.body.userId,
        cartId: cart._id.toString(),
      },
    });

    const line_items = req.body.cartData.map((item) => {
      return {
        price_data: {
          currency: "Egp",
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

    const session = await stripe.checkout.sessions.create({
      line_items,
      customer: customer.id,
      mode: "payment",
      success_url: `${process.env.CLIEN_URL}/checkout-success`,
      cancel_url: `${process.env.CLIEN_URL}/checkout-cancel`,
    });
    res.status(201).json({ url: session.url });
  } catch (err) {
    //console.log(err.message)
    next(err);
  }
};

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
    //const totalAmount = books.reduce((acc, book) => acc + book.price, 0);
    const newOrder = new Order({
      userId: customer.metadata.userId,
      cartId: customer.metadata.cartId,
      books,
      totalAmount:data.amount_total,
    });
    await newOrder.save();
   // console.log(newOrder)
    cart.items = [];
    await cart.save();
  } catch (error) {
    console.log("there are error in createOrder");
    //console.log(error.message)
  }
};

const webhook = async (req, res, next) => {
  let data;
  let eventType;
  if (endpointSecret) {
    const signature = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        endpointSecret
      );
    } catch (err) {
      next(err);

      return;
    }
    data = event.data.object;
    eventType = event.type;
  } else {
    data = req.body.data.object;
    eventType = req.body.type;
  }
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

  res.send().end();

};

module.exports = { webhook, createOrder, createCheckoutSession };
