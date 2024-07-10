const AppError = require('../utils/appError');
const Review = require('./../models/reviewModel');
const APIfeatures = require('./../utils/apiFeatures');
const catchAsync = require('express-async-handler');
const factory = require('./handlerFactory');

exports.getAllreviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  const review = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    results: review.length,
    data: {
      review,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  //Allow Nested Routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  const NewReview = await Review.create(req.body);

  res.status(201).json({
    status: 'succes',
    data: {
      review: NewReview,
    },
  });
});

exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
