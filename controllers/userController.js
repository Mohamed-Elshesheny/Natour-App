const catchAsync = require('express-async-handler');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedfields) => {
  //The purpose of this function is to create a new object that contains only the properties specified
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedfields.includes(el)) newObj[el] = obj[el]; // هل الالويد فيلدز فيها الحاجات الي ف الي ريكويست . بودي ؟؟
  });
  return newObj;
};

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
  // res.status(200).json({
  //   status:'success',
  //   data:{

  //   }
  // })
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // this only for update data not update passowrd
  // 1) Create error if user POSTs password
  if (req.body.password || req.body.passwordconfirm)
    return next(
      new AppError(
        'This route is not for update password! please go to updatePassword',
        400,
      ),
    );
  //await user.save(); // we can't user save() method here
  // 2) Filterd out unwanted fields to be updated
  const filteredbody = filterObj(req.body, 'name', 'email');

  // 3) Update user document
  const updatededUser = await User.findByIdAndUpdate(
    // This operation only allowed when user is loged in so the user id is stored in the request
    req.user.id,
    filteredbody,
    {
      new: true,
      runValidators: true,
    },
  );
  res.status(200).json({
    status: 'success',
    data: {
      user: updatededUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
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

exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
