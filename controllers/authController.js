const crypto = require('crypto');
const { promisify } = require('util');
const catchAsync = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const signToken = (id) => {
  // Here we create the JWT by using the payload and header and secret to make it
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
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
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body; // equal to req.body.email/,password

  //1) Check if email and password is correct [بيشوف انت حطيت اميل وباص ولا لا اصلا ف الاول ويخش علي المرحله الي بعدها ]
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  //2) Check if user exists and password is correct [بيشوف لو الايميل متسجل اصلا والباص صح ]
  const user = await User.findOne({ email }).select('+password'); // we do the select casue we made password hidden in the db

  // if the didn't find user so he won't run the next code to check the password
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Invaild email or password', 401));
  }
  //3) If everything is okay send token to clinet [كلو تمام خلاص دخلو وابعت التوكين انو vaild ]
  createSendToken(user, 200, res); //payload is user._id
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]; // هنا علشان ناخد الجزء بتاع التوكين بس من غير bearer وحطيناها في arrary
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! please log in to get access', 401),
    );
  }
  // 2) Verification The Token
  const accessToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET,
  );
  //console.log(decoded);

  // 3) Check if user still exists
  const FreshUser = await User.findById(accessToken.id); // [التوكين دا فيه يوزر برقم ٣٤٥ ولكن اليوزر دا اتمسح هو هيشوف بقي هو لسه موجود ولا لh]
  if (!FreshUser) {
    return next(
      new AppError('The token for this user does no longer exists!', 401),
    );
  }

  // 4) Check if user changed the password after the token was issued
  if (FreshUser.ChangedPasswordAfter(accessToken.iat)) {
    //  this will run if [ChangedPasswordAfter] returns TRUE
    return next(
      new AppError(
        'The user recently changed the password! please log in again',
        401,
      ),
    );
  }

  // GRANT ACCESS TO PROTACTED ROUTES
  req.user = FreshUser;
  next();
});

exports.restricTo = (...roles) => {
  // roles is an array of ['admin','lead-guide'] return is the middleware fun
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      // فكره تانيه: انو هيدخل الدور بتاع المستخدم دا لو مش موجود داخل ال الادوار بالتالي ملوش صلاحيه
      // ياعني بيقول لو مفيش في الي ال arrary ادمن او ليد جايد يبقي مينفعش ياخد الاذن
      return next(
        new AppError('You do not have permission to perform this!', 403),
      );
    }
    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email }); // مش هنعمل فايند باي اي دي علشان اليوزر ميعرفش ال اي دي بتاعو اصلا ولكن عارف اليوزر
  if (!user) {
    return next(new AppError('There is no user with that email address!', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password
  and passwordConfirm to: ${resetURL}.\n If you didn't forget your password, please ignore this email!`;

  // 3) Send it to user's email
  try {
    await sendEmail({
      email: req.body.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpired = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There an error sending the email try again later!', 500),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on Token
  const hashedToken = crypto // هنا هو عاوز يعمل تشفير لي التوكين الي ف الي url
    .createHash('sha256') // cause in the DB the token is hashed so we need to compare between them
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpired: { $gt: Date.now() }, // هنا بيقارن وقت انتهاء التوكين بالوقت الحالي ممكن التوكين ينتهي بعد ٥ ايام من الوقت الحالي
  });

  // 2) If token has not expired , and there is a user , set new password
  if (!user) {
    return next(new AppError('Token is invalid or expired!', 400));
  }
  console.log('object');
  user.password = req.body.password;
  user.passwordconfirm = req.body.passwordconfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpired = undefined;
  await user.save();
  console.log('ooobject');

  // 3)

  // 4) Log the user in ,send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('The currentPassowrd is invalid!', 401));
  }

  // 3) If so update the current passowrd with the new one
  user.password = req.body.password;
  user.passwordconfirm = req.body.passwordconfirm;
  await user.save();

  // 4) Log the user in , send JWT
  createSendToken(user, 200, res);
});
