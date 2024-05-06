const express = require('express');
const { limit } = require('express-limit');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const AppError = require('./../utils/appError');

const Router = express.Router();

const loginLimiter = limit({
  max: 3, // 3 requests
  period: 60 * 1000, // per minute (60 seconds)
  message: 'Too many attempts! Please try again later',
  status: 429,
  onLimitExceeded: (req, res, next) => {
    return next(new AppError('Too many attempts! Please try again later', 429)); // 429 not seen by error controller !
  },
});

Router.post('/signup', authController.signup);
Router.post('/login', loginLimiter, authController.login);
Router.post('/forgetPassword', authController.forgetPassword);
Router.patch('/resetPassword/:token', authController.resetPassword);
Router.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword,
);

Router.delete('/deleteMe', authController.protect, userController.deleteMe);

Router.patch('/updateMe', authController.protect, userController.updateMe);
Router.route('/')
  .get(userController.getAllusers)
  .post(userController.createuser);

Router.route('/:id')
  .get(userController.getuser)
  .patch(userController.updateuser)
  .delete(userController.deleteuser);

module.exports = Router;
