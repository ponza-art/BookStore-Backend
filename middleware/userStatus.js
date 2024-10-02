const AppError = require("../utils/appError");

const checkUserStatus = async (req, res, next) => {
  try {
    const user = req.user; 

    if (user.status === false) {
      return new AppError("User is blocked", 403);
    }

    next(); 
  } catch (error) {
    return next(new AppError("Failed to check user status", 500));
  }
};

module.exports = checkUserStatus;
