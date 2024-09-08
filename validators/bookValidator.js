const joi = require("joi");

module.exports = joi.object({
  title: joi.string().required(),
  description: joi.string().required(),
  sourcePath: joi.string().required(),
});
