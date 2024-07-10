const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

//This option can merge 2 different routes
const Router = express.Router({ mergeParams: true });

Router.route('/')
  .get(reviewController.getAllreviews)
  .post(
    authController.protect,
    authController.restricTo('user', 'admin'),
    reviewController.SetTourUserId,
    reviewController.createReview,
  );

Router.route('/:id').delete(reviewController.deleteReview);
.patch(reviewController.updateReview);

module.exports = Router;
