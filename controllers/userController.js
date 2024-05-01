const User = require('./../models/userModel');
const catchAsync = require('express-async-handler');

exports.getAllusers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  // send the response
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: users.length,
    data: {
      users: users, // in E63 we can have key-value withot '' if they have the same name...
    },
  });
});

exports.getuser = (req, res) => {
  res.status(500).json({
    status: 'success',
    message: 'This route is not yet',
  });
};

exports.createuser = (req, res) => {
  res.status(500).json({
    status: 'error',
    massage: 'This route is not yet defined..!',
  });
};

exports.updateuser = (req, res) => {
  res.status(500).json({
    status: 'error',
    massage: 'This route is not yet defined..!',
  });
};

exports.deleteuser = (req, res) => {
  res.status(500).json({
    status: 'error',
    massage: 'This route is not yet defined..!',
  });
};
