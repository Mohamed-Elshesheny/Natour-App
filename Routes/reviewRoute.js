const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

// This option can merge 2 different routes
const Router = express.Router({ mergeParams: true });

Router.use(authController.protect);

Router.route('/').get(reviewController.getAllreviews).post(
  authController.restricTo('user'), // Corrected to `restricTo`
  reviewController.SetTourUserId,
  reviewController.createReview,
);

Router.route('/:id')
  .delete(
    authController.restricTo('user', 'admin'), // Corrected to `restricTo`
    reviewController.deleteReview,
  )
  .patch(
    authController.restricTo('user', 'admin'), // Corrected to `restricTo`
    reviewController.updateReview,
  )
  .get(reviewController.getReview);

module.exports = Router;
