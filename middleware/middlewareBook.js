const validateSchema = require("../validators/bookValidator");
const validateBook = async (req, res, next) => {
  try {
    await validateSchema.validate(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      error: " data is incorrect Please check all fields and try again",
    });
  }
};

module.exports = validateBook;
