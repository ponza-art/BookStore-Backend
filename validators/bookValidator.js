const joi = require('joi');

module.exports = joi.object({
  title: joi.string().required(),
  description: joi.string().required(),
  price: joi.number().required(),
  category: joi.string().required(),
  author: joi.string().required(),
  coverImage: joi.string().required(),
  samplePdf: joi.string().required(),
  sourcePath: joi.string().required(),
});
