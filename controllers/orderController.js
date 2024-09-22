const Order = require("../models/orderSchema");
const Cart = require("../models/cartSchema");
const AppError = require("../utils/appError");

const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId }).populate(
      "items.bookId",
      "title price"
    );
    if (!cart || cart.items.length === 0) {
      return next(new AppError("Cart is empty", 400));
    }
    const books = cart.items.map((item) => ({
      bookId: item.bookId._id,
      title: item.bookId.title,
      price: item.bookId.price,
    }));
    const totalAmount = books.reduce((acc, book) => acc + book.price, 0);
    const newOrder = new Order({
      userId,
      cartId: cart._id,
      books,
      totalAmount,
    });
    await newOrder.save();
    cart.items = [];
    await cart.save();

    res.status(201).json(newOrder);
  } catch (error) {
    next(error);
  }
};
const getAllOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// const getOrderById = async (req, res, next) => {
//   try {
//     const { id } = req.body;
//     const order = await Order.findById(id).populate(
//       "books.bookId",
//       "title price"
//     );
//     if (!order) {
//       return next(new AppError("Order not found", 404));
//     }
//     res.json(order);
//   } catch (error) {
//     next(error);
//   }
// };

// const deleteOrder = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const order = await Order.findByIdAndDelete(id);
//     if (!order) {
//       return next(new AppError("Order not found", 404));
//     }
//     res.json({ message: "Order deleted" });
//   } catch (error) {
//     next(error);
//   }
// };

module.exports = { createOrder, getAllOrders };
