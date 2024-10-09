const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User schema
    required: true,
  },
  cardNumber: {
    type: String,
    required: true,
  },
  cardholderName: {
    type: String,
    required: true,
  },
  expiryDate: {
    type: String,
    required: true,
  },
  saved: {
    type: Boolean,
    default: false, 
  },
}, { timestamps: true });

module.exports = mongoose.model("Card", cardSchema);
