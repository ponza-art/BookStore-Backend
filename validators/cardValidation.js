const Joi = require("joi");

const cardSchemaValidation = Joi.object({
  cardNumber: Joi.string().required().label("Card Number"),
  cardholderName: Joi.string().required().label("Cardholder Name"),
  expiryDate: Joi.string().required().label("Expiry Date"),
  saved: Joi.boolean().optional().label("Saved"),
});

module.exports = { cardSchemaValidation };
