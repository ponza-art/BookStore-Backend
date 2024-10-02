const AppError = require("../utils/appError");

const checkUserStatus = async (req, res, next) => {
  try {
    const user = req.user; // Assuming user info is stored in req.user after authentication

    if (user.status === false) {
      return next(new AppError("User is blocked", 403));
    }

    next(); // User is allowed, proceed
  } catch (error) {
    return next(new AppError("Failed to check user status", 500));
  }
};

module.exports = checkUserStatus;
