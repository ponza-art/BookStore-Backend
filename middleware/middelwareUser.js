
const httpStatusText = require("../utils/httpStatusText.js");
const {userSchemaJoi} = require("../validators/userValidate.js"); 
const {loginSchemaJoi} = require("../validators/LoginValidator.js"); 
const asyncWrapper = require("./asyncWrapper.js");
const appError = require("../utils/appError.js");

const validateUser = asyncWrapper(
  async (req, res, next) => {
    const { error } = userSchemaJoi.validate(req.body);
    if (error) {
      
      const err = appError.create(
        "Data is incorrect. Please check all fields and try again.",
        402,
        httpStatusText.FAIL
      );
      return next(err); 
    }


    next();
  }
);
const validateLoginUser = asyncWrapper(
  async (req, res, next) => {
    const { error } = loginSchemaJoi.validate(req.body);
    if (error) {
      
      const err = appError.create(
        "Data is incorrect. Please check all fields and try again.",
        402,
        httpStatusText.FAIL
      );
      return next(err); 
    }


    next();
  }
);

module.exports = { validateUser ,validateLoginUser};
