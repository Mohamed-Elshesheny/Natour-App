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

// This middle-ware will use the protect fun for all the remaining routes
Router.use(authController.protect);

Router.patch('/updatePassword', authController.updatePassword);
Router.get('/me', userController.getMe, userController.getUser);
Router.delete('/deleteMe', userController.deleteMe);
Router.patch('/updateMe', userController.updateMe);

// The middle-ware to restrict the actions
Router.use(authController.restricTo('admin'));

Router.route('/').get(userController.getAllusers);

Router.route('/:id')
  .patch(userController.updateUser)
  .get(userController.getUser)
  .delete(userController.deleteUser);

module.exports = Router;
