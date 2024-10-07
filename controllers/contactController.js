const Contact = require("../models/contactSchema");
const AppError = require("../utils/appError");

const createMessage = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    // Get user from the token (assumes req.user is set after token verification)
    const user = req.user;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newContact = new Contact({
      name,
      email,
      message,
      user: user._id // Save the user ID with the message
    });

    await newContact.save();
    res.status(201).json(newContact);
  } catch (error) {
    next(new AppError("Failed to create message: " + error, 500));
  }
};

const getMessages = async (req, res, next) => {
  try {
    const messages = await Contact.find();
    res.json(messages);
  } catch (error) {
    next(new AppError("Failed to fetch messages: " + error, 500));
  }
};



const deleteMessage = async (req, res, next) => {
  const { id } = req.params;
  try {
    const message = await Contact.findById(id);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    await Contact.findByIdAndDelete(id);
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    next(new AppError("Failed to delete message: " + error, 500));
  }
};

module.exports = {
  createMessage,
  getMessages,
  updateMessageStatus,
  deleteMessage,
};
