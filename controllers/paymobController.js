const axios = require('axios');
const Order = require("../models/orderSchema");
const Cart = require("../models/cartSchema");
const AppError = require("../utils/appError");


const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    
    // Step 1: Fetch the cart for the user
    const cart = await Cart.findOne({ userId }).populate(
      "items.bookId",
      "title price coverImage description sourcePath"
    );

    if (!cart || cart.items.length === 0) {
      return next(new AppError("Cart is empty", 400));
    }

    const books = cart.items.map((item) => ({
      bookId: item.bookId._id,
      title: item.bookId.title,
      price: item.bookId.price,
      coverImage: item.bookId.coverImage,
      description: item.bookId.description,
      sourcePath: item.bookId.sourcePath,
    }));

    const totalAmount = books.reduce((acc, book) => acc + book.price, 0);

    // Step 2: Create a new order in your system
    const newOrder = new Order({
      userId,
      cartId: cart._id,
      books,
      totalAmount,
    });

    await newOrder.save();

    // Step 3: Clear the user's cart after saving the order
    // cart.items = []; 
    await cart.save();

    // Step 4: Authenticate with Paymob
    const authToken = await axios.post('https://accept.paymob.com/api/auth/tokens', {
      api_key: process.env.PAYMOB_API_KEY, // Ensure PAYMOB_API_KEY is in your .env file
      
    });
    
    const token = authToken.data.token;
    
    // Step 5: Create a Paymob order
    const paymobOrder = await axios.post('https://accept.paymob.com/api/ecommerce/orders', {
        auth_token: token,
        delivery_needed: "false",
        amount_cents: totalAmount * 100, // Convert to cents
        currency: "EGP",
        items: books.map(book => ({
            name: book.title,
            description:book.description,
            amount_cents: book.price * 100,
            quantity: 1
        }))
    });
    
    const orderId = paymobOrder.data.id;
    
    // Step 6: Generate a payment key using Paymob's API
    const paymentKey = await axios.post('https://accept.paymob.com/api/acceptance/payment_keys', {
        auth_token: token,
        amount_cents: totalAmount * 100,  // Amount in cents
        expiration: 3600,                 // 1-hour expiration time
        order_id: orderId,                // Paymob order ID
        billing_data: {
          email: req.user.email,             // User's email from the request
          first_name: req.user.firstName || req.user.username,  // First name or username
          last_name: req.user.lastName || "Last",               // Last name (can be a default)
          phone_number: req.user.phone || "01201450980",        // User's phone number
          country: "EGY",                  // Country code (Egypt)
          city: "Cairo",                   // Replace with actual user billing info if available
          street: "Street",                // Replace with actual user street
          building: "Building",            // Replace with actual building info
          floor: "Floor",                  // Replace with actual floor info
          apartment: "Apartment",          // Replace with actual apartment info
        },
        currency: "EGP",                   // Currency in Egyptian Pounds
        integration_id: process.env.PAYMOB_INTEGRATION_ID,  // From .env file
      });
      
    
    const paymentToken =  paymentKey.data.token;

    // Step 7: Send the order and payment key to the client for payment
    res.status(201).json({
      order: newOrder,
      paymentToken,
    });

  } catch (error) {
    next(error); // Handle errors properly
  }
};


module.exports = {createOrder}