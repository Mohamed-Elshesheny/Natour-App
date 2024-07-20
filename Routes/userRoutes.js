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

Router.use(authController.protect);

Router.get('/Me', userController.getMe, userController.getUser);
Router.patch('/updatePassword', authController.updatePassword);
Router.delete('/deleteMe', userController.deleteMe);
Router.patch('/updateMe', userController.updateMe);

Router.use(authController.restricTo('admin'));

Router.route('/').get(userController.getAllusers);

Router.route('/:id')
  .patch(userController.updateUser)
  .get(userController.getUser)
  .delete(userController.deleteUser);

module.exports = Router;
