const httpStatusText = require("../utils/httpStatusText.js");
const { userSchemaJoi } = require("../validators/userValidate.js");
const { loginSchemaJoi } = require("../validators/LoginValidator.js");

const AppError = require("../utils/appError.js");

const validateUser = async (req, res, next) => {
  try {
    const { error } = userSchemaJoi.validate(req.body);
    if (error) {
      return next(
        new AppError(
          "Data is incorrect. Please check all fields and try again.",
          400 
        )
      );
    }
    next(); 
  } catch (error) {
    return next(new AppError("Register Failed", 500));
  }
};

const validateLoginUser = async (req, res, next) => {
  try {
    const { error } = loginSchemaJoi.validate(req.body);
    if (error) {
      return next(
        new AppError(
          "Data is incorrect. Please check all fields and try again.",
          400
        )
      );
    }
    next(); 
  } catch (error) {
   return next(new AppError("Login Failed", 500));
  }
};

module.exports = { validateUser, validateLoginUser };
