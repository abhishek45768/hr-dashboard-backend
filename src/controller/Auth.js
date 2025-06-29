const User = require('../model/User');
const ErrorResponse = require('../utils/errorResponse');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    if (confirmPassword != password) {
      return next(new ErrorResponse('Password does not match', 400));
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new ErrorResponse('User already exists', 400));
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'HR'
    });

    return sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};


exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorResponse('Please provide an email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};





