const axios = require('axios');
const Order = require("../models/orderSchema");
const Cart = require("../models/cartSchema");
const AppError = require("../utils/appError");

const createOrder = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const cart = await Cart.findOne({ userId }).populate(
            "items.bookId",
            "title discountedPrice coverImage description sourcePath"
        );

        if (!cart || cart.items.length === 0) {
            return next(new AppError("Cart is empty", 400));
        }

        const books = cart.items.map((item) => ({
            bookId: item.bookId._id,
            title: item.bookId.title,
            price: Math.round(item.bookId.discountedPrice * 100) / 100,  // rounding to ensure correct value
            coverImage: item.bookId.coverImage,
            description: item.bookId.description,
            sourcePath: item.bookId.sourcePath,
        }));

        const totalAmount = books.reduce((acc, book) => acc + book.price, 0).toFixed(2); // rounding total amount

        const newOrder = new Order({
            userId,
            cartId: cart._id,
            books,
            totalAmount,
        });

        const authToken = await axios.post('https://accept.paymob.com/api/auth/tokens', {
            api_key: process.env.PAYMOB_API_KEY,
        });

        const token = authToken.data.token;

        const paymobOrder = await axios.post('https://accept.paymob.com/api/ecommerce/orders', {
            auth_token: token,
            delivery_needed: "false",
            amount_cents: Math.round(totalAmount * 100), // amount in cents
            currency: "EGP",
            items: books.map(book => ({
                name: book.title,
                description: book.description,
                amount_cents: Math.round(book.price * 100), // amount in cents
                quantity: 1
            }))
        });

        const orderId = paymobOrder.data.id;

        const paymentKey = await axios.post('https://accept.paymob.com/api/acceptance/payment_keys', {
            auth_token: token,
            amount_cents: Math.round(totalAmount * 100), // amount in cents
            expiration: 3600,
            order_id: orderId,
            billing_data: {
                email: req.user.email,
                first_name: req.user.firstName || req.user.username || "First",
                last_name: req.user.lastName || "Last",
                phone_number: req.user.phone || "01201450980", // fallback phone number
                country: "EGY",
                city: "Cairo",
                street: "Street",
                building: "Building",
                floor: "Floor",
                apartment: "Apartment",
            },
            currency: "EGP",
            integration_id: process.env.PAYMOB_INTEGRATION_ID,
        });

        const paymentToken = paymentKey.data.token;
        if (paymentToken) {
            await newOrder.save();
            cart.items = [];
            await cart.save();
        }

        res.status(201).json({
            order: newOrder,
            paymentToken,
        });

    } catch (error) {
        next(error);
    }
};

module.exports = { createOrder };
