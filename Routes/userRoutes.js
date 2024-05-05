const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const Router = express.Router();

Router.param('id', (req, res, next, val) => {
  // val will contain the value of the id
  console.log(`Tour id is ${val}`);
  next();
});

Router.post('/signup', authController.signup);
Router.post('/login', authController.login);
Router.post('/forgetPassword', authController.forgetPassword);
Router.patch('/resetPassword/:token', authController.resetPassword);

Router.route('/')
  .get(userController.getAllusers)
  .post(userController.createuser);

Router.route('/:id')
  .get(userController.getuser)
  .patch(userController.updateuser)
  .delete(userController.deleteuser);

module.exports = Router;
