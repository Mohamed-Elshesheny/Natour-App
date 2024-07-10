const express = require('express');
// const { limit } = require('express-limit');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

// const AppError = require('./../utils/appError');

const Router = express.Router();

Router.post('/signup', authController.signup);
Router.post('/login', authController.login);
Router.post('/forgetPassword', authController.forgetPassword);
Router.patch('/resetPassword/:token', authController.resetPassword);
Router.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword,
);

Router.delete('/deleteMe', authController.protect, userController.deleteMe);
Router.patch('/updateMe', authController.protect, userController.updateMe);

Router.route('/').get(userController.getAllusers);

Router.route('/:id')
  .patch(userController.updateUser)
  .get(userController.getuser)
  .delete(userController.deleteUser);

module.exports = Router;
