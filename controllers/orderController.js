const Order = require("../models/orderSchema");
const AppError = require("../utils/appError");

const createOrder = async (req, res, next) => {
  try {
    const { books, totalAmount } = req.body;
    const userId = req.user._id;

    const newOrder = new Order({ userId, books, totalAmount });
    await newOrder.save();

    res.status(201).json(newOrder);
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ userId }).populate("books.bookId", "title price");
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate("books.bookId", "title price");
    if (!order) {
      return next(new AppError("Order not found", 404));
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return next(new AppError("Order not found", 404));
    }
    res.json({ message: "Order deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getAllOrders, getOrderById, deleteOrder };
