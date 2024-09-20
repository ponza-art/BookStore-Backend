const mongoose = require("mongoose");

const favoritesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  books: [
    {
      bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true,
      },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Favorites", favoritesSchema);
