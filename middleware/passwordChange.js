const AppError = require('../utils/appError')

const validatePasswordChange = (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return next(new AppError("Invalid password details", 400));
    }
    next();
  };
  
  module.exports = { validatePasswordChange };
  