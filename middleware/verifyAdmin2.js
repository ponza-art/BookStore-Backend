var jwt = require("jsonwebtoken");
const httpStatusText = require("../utils/httpStatusText");
const AppError = require("../utils/appError");
const User = require("../models/userSchema");

const verifyAdmin2 = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  
  if (!authHeader) {
    return next(new AppError("Authorization token is required", 401));
  }

  try {
    const actualToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET_KEY);

    const checkUser = await User.findById(decoded.id);
    
    if (!checkUser) {
      return next(new AppError("User not found", 404));
    }

    if (!checkUser.isAdmin ) {
      return next(new AppError("User not authorized", 403));
    }

    next();
  } catch (error) {
    return next(
      new AppError(
        error.name === "TokenExpiredError" ? "Token has expired" : "Invalid or malformed token",
        401
      )
    );
  }
};

module.exports = verifyAdmin2;
