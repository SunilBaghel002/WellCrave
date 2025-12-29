// middleware/admin.js
const AppError = require("../utils/appError");

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new AppError("This action requires admin privileges", 403));
  }
  next();
};

exports.isAdminOrModerator = (req, res, next) => {
  if (!["admin", "moderator"].includes(req.user.role)) {
    return next(
      new AppError("This action requires admin or moderator privileges", 403)
    );
  }
  next();
};
