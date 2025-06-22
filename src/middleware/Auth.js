const jwt = require('jsonwebtoken');
const User = require('../model/User');
const ErrorResponse = require('../utils/errorResponse');

exports.protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp < currentTime) {
        return next(new ErrorResponse('Token expired, please login again', 401));
      }

      req.user = await User.findById(decoded.id);
      
      if (!req.user) {
        return next(new ErrorResponse('User not found', 401));
      }
      
      next();
    } catch (err) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }
  } catch (error) {
    next(error);
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};