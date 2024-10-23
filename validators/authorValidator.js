const Joi = require("joi");

const createAuthorSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.base": "Name should be a type of text",
    "string.empty": "Name can not be an empty field",
    "string.min": "Name should have a minimum length of 3 characters",
    "string.max": "Name should have a maximum length of 100 characters",
    "any.required": "Author name is required",
  }),
  image: Joi.any().required().messages({
    "any.required": "Image is required",
  }),
});

const updateAuthorSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional().messages({
    "string.base": "Name should be a type of text",
    "string.min": "Name should have a minimum length of 3 characters",
    "string.max": "Name should have a maximum length of 100 characters",
  }),
  image: Joi.any().optional().messages({
    "any.required": "Image is required",

  }),
});

module.exports = {
  createAuthorSchema,
  updateAuthorSchema,
};
