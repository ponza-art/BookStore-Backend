const Joi = require("joi");

const createMessageSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.empty": "Name cannot be empty",
    "string.min": "Name should have at least 3 characters",
    "string.max": "Name can have at most 100 characters",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().required().messages({

    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
  message: Joi.string().min(10).required().messages({
    "string.empty": "Message cannot be empty",
    "string.min": "Message should have at least 10 characters",
    "any.required": "Message is required",
  }),
});

module.exports = {
  createMessageSchema,
};
