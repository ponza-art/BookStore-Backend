var jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const verifyToken = async (req, res, next) => {
  const authHeader =
    req.headers["Authorization"] || req.headers["authorization"];

  if (!authHeader) {
    return next(new AppError("Token is required", 401)); 
  }
  const token = authHeader.split(" ")[1];
  

  try {
    jwt.verify(token, process.env.JWT_SECRET_KEY);
  
    next();
  } catch (error) {
    return next(new AppError("Invalid Token", 401));
  }
};
module.exports = verifyToken;