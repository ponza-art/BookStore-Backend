const Card = require("../models/cardSchema"); 

const saveCard = async (req, res, next) => {
  try {
    const { cardNumber, cardholderName, expiryDate, saved } = req.body;
    const userId = req.user.id;

    const newCard = new Card({
      userId,
      cardNumber,
      cardholderName,
      expiryDate,
      saved,
    });

    await newCard.save();
    res.status(201).json({
      status: "success",
      message: "Card saved successfully",
      data: { card: newCard },
    });
  } catch (error) {
    next(new AppError("Failed to save card", 500));
  }
};

const getAllUserCards = async (req, res, next) => {
    try {
      const userId = req.user.id; 
  
      const cards = await Card.find({ userId });
  
      if (!cards) {
        return res.status(404).json({
          status: "fail",
          message: "No cards found for this user",
        });
      }
  
      res.status(200).json({
        status: "success",
        message: "Cards retrieved successfully",
        data: { cards },
      });
    } catch (error) {
      next(new AppError("Failed to retrieve cards", 500));
    }
  };

module.exports = { saveCard, getAllUserCards };
