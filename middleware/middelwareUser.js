const { userSchemaJoi } = require("../validators/userValidate.js");

export const validateUser = async (req, res, next) => {
  try {
    await userSchemaJoi.validate(req.body);
    next();
  } catch (error) {
    return res.status(422).json({
      error: "data is incorrect Please check all fields and try again",
    });
  }
};
