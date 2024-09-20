const Favorites = require("../models/favoritesSchema");
const AppError = require("../utils/appError");

const addToFavorites = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    let favorites = await Favorites.findOne({ userId });
    if (!favorites) {
      favorites = new Favorites({ userId, books: [] });
    }

    if (!favorites.books.find(item => item.bookId.toString() === bookId)) {
      favorites.books.push({ bookId });
      await favorites.save();
    }

    res.status(201).json(favorites);
  } catch (error) {
    next(error);
  }
};

const getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const favorites = await Favorites.findOne({ userId }).populate("books.bookId");
    if (!favorites) {
      return next(new AppError("Favorites not found", 404));
    }
    res.json(favorites);
  } catch (error) {
    next(error);
  }
};

const deleteFromFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;

    const favorites = await Favorites.findOne({ userId });
    if (!favorites) {
      return next(new AppError("Favorites not found", 404));
    }

    favorites.books = favorites.books.filter(item => item.bookId.toString() !== bookId);
    await favorites.save();

    res.json(favorites);
  } catch (error) {
    next(error);
  }
};

module.exports = { addToFavorites, getFavorites, deleteFromFavorites };
