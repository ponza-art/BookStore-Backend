const axios = require('axios');
const Order = require("../models/orderSchema");
const Cart = require("../models/cartSchema");
const AppError = require("../utils/appError");

const processOrderAndPayment = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Step 1: Fetch user's cart
        const cart = await Cart.findOne({ userId }).populate(
            "items.bookId",
            "title discountedPrice coverImage description sourcePath"
        );

        if (!cart || cart.items.length === 0) {
            return next(new AppError("Cart is empty", 400));
        }

        // Step 2: Map cart items to books for order
        const books = cart.items.map((item) => ({
            bookId: item.bookId._id,
            title: item.bookId.title,
            price: item.bookId.discountedPrice,
            coverImage: item.bookId.coverImage,
            description: item.bookId.description,
            sourcePath: item.bookId.sourcePath,
        }));

        // Calculate total amount
        const totalAmount = books.reduce((acc, book) => acc + book.price, 0);

        // Step 3: Get authentication token from Paymob
        const authResponse = await axios.post('https://accept.paymob.com/api/auth/tokens', {
            api_key: process.env.PAYMOB_API_KEY,
        });

        const token = authResponse.data.token;

        // Step 4: Create Paymob order
        const paymobOrderResponse = await axios.post('https://accept.paymob.com/api/ecommerce/orders', {
            auth_token: token,
            delivery_needed: "false",
            amount_cents: totalAmount * 100,
            currency: "EGP",
            items: books.map(book => ({
                name: book.title,
                description: book.description,
                amount_cents: book.price * 100,
                quantity: 1
            })),
        });

        const paymobOrderId = paymobOrderResponse.data.id;

        // Step 5: Generate payment key for iFrame
        const paymentKeyResponse = await axios.post('https://accept.paymob.com/api/acceptance/payment_keys', {
            auth_token: token,
            amount_cents: totalAmount * 100,
            expiration: 3600,
            order_id: paymobOrderId,
            billing_data: {
                email: req.user.email,
                first_name: req.user.firstName || req.user.username,
                last_name: req.user.lastName || "Last",
                phone_number: req.user.phone || "01201450980",
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

        const paymentToken = paymentKeyResponse.data.token;

        // Step 6: Return paymentToken to the frontend to load the iFrame
        res.status(200).json({
            paymentToken,
            paymobOrderId
        });

    } catch (error) {
        next(error);
    }
};

const confirmPaymentAndUpdateOrder = async (req, res, next) => {
    try {
        const { order_id, success } = req.body;

        if (!success) {
            return next(new AppError('Payment failed', 400));
        }

        // Step 7: Retrieve the order by Paymob order ID
        const order = await Order.findOne({ paymobOrderId: order_id });

        if (!order) {
            return next(new AppError('Order not found', 404));
        }

        // Step 8: Update the order status and finalize
        order.status = "Paid";
        await order.save();

        // Step 9: Clear the user's cart
        const cart = await Cart.findById(order.cartId);
        cart.items = [];
        await cart.save();

        res.status(200).json({
            status: "success",
            message: "Order confirmed and updated"
        });

    } catch (error) {
        next(error);
    }
};

module.exports = { processOrderAndPayment, confirmPaymentAndUpdateOrder };
