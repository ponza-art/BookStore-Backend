const { bookSchemaJoi } = require("../validators/bookValidate.js");
export const validateBook = async (req, res, next) => {
  try {
    await bookSchemaJoi.validate(req.body);
    next();
  } catch (error) {
    return res.status(422).json({
      error: " data is incorrect Please check all fields and try again",
    });
  }
};
