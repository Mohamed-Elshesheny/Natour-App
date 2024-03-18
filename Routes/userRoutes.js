const express = require('express');

const userController = require('./../controllers/userController');

const Router = express.Router();

Router.param('id', (req, res, next, val) => {
  // val will contain the value of the id
  console.log(`Tour id is ${val}`);
  next();
});

Router.route('/')
  .get(userController.getAllusers)
  .post(userController.createuser);

Router.route('/:id')
  .get(userController.getuser)
  .patch(userController.updateuser)
  .delete(userController.deleteuser);

module.exports = Router;
