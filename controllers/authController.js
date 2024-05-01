const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('express-async-handler');
const AppError = require('./../utils/appError');
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    // This will allow only the data that we need that user can put
    // In this way he can't but himself an admin
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordconfirm: req.body.passwordconfirm,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body; // equal to req.body.email/,password

  //1) Check if email and password is correct [بيشوف انت حطيت اميل وباص ولا لا اصلا ف الاول ويخش علي المرحله الي بعدها ]
  if (!email || !password) {
    return next(new AppError('Please provide email and password'), 400);
  }
  //2) Check if user exists and password is correct [بيشوف لو الايميل متسجل اصلا والباص صح ]
  const user = await User.findOne({ email }).select('+password'); // we do the select casue we made password hidden in the db

  // if the didn't find user so he won't run the next code to check the password
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Invaild email or password'), 401);
  }
  //3) If everything is okay send token to clinet [كلو تمام خلاص دخلو وابعت التوكين انو vaild ]
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});
