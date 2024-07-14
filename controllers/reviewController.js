const AppError = require('../utils/appError');
const Review = require('./../models/reviewModel');
const APIfeatures = require('./../utils/apiFeatures');
// const catchAsync = require('express-async-handler');
const factory = require('./handlerFactory');

//MiddleWare Before Creating The Review
exports.SetTourUserId = (req, res, next) => {
  //Allow Nested Routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.createReview = factory.createOne(Review);
exports.getAllreviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
