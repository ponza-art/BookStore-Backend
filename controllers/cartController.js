const Cart = require("../models/cartSchema");
const AppError = require("../utils/appError");

const addToCart = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const userId = req.user._id;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    if (!cart.items.find(item => item.bookId.toString() === bookId)) {
      cart.items.push({ bookId });
      await cart.save();
    }

    res.status(201).json(cart);
  } catch (error) {
    next(error);
  }
};

const getCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ userId }).populate("items.bookId");
    if (!cart) {
      return next(new AppError("Cart not found", 404));
    }
    res.json(cart);
  } catch (error) {
    next(error);
  }
};


const deleteFromCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { bookId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return next(new AppError("Cart not found", 404));
    }

    cart.items = cart.items.filter(item => item.bookId.toString() !== bookId);
    await cart.save();

    res.json(cart);
  } catch (error) {
    next(error);
  }
};

module.exports = { addToCart, getCart, updateCart, deleteFromCart };
