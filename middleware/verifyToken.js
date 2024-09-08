var jwt = require("jsonwebtoken");
const  httpStatusText =require("../utils/httpStatusText");
const appError = require("../utils/appError");
const verifyToken = async (req, res, next) => {
  const authHeader =
    req.headers["Authorization"] || req.headers["authorization"];

  if (!authHeader) {
    const err = appError.create(
        "token is required",
        401,
        httpStatusText.FAIL
      );
      return next(err); 
  }
  const token = authHeader.split(" ")[1];
  

  try {
    jwt.verify(token, process.env.JWT_SECRET_KEY);
  
    next();
  } catch (error) {
    const err = appError.create(
        "Invalid Token",
        401,
        httpStatusText.FAIL
      );
      return next(err);
  }
};
module.exports = verifyToken;