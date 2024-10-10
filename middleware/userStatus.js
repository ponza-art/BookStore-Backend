const AppError = require("../utils/appError");
const User = require("../models/userSchema");
const UserGoogle = require("../models/userGoogleSchema");

const checkUserStatus = async (req, res, next) => {
  try {
    const user = req.user;
    
    let userData = await User.findById(user.id);

    if (!userData) {
      userData = await UserGoogle.findById(user.id);
    }
    

    if (userData.status === false) {
      return next(new AppError("User is blocked", 403));
    }

    next();
  } catch (error) {
    return next(new AppError("Failed to check user status", 500));
  }
};

module.exports = checkUserStatus;