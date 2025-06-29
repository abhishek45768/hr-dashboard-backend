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





const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const hours = parseInt(process.env.JWT_COOKIE_EXPIRE) || 1;

  const options = {
    expires: new Date(Date.now() + hours * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: 'None'
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  return res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      message : "User created successfully",
      success: true,
      token,
      data: user,
      expireBy : options.expires
    });
};