const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
//const catchAsync = require('./../utils/catchAsync');
const catchAsync = require('express-async-handler');
const factory = require('./handlerFactory');

exports.aliasTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name, price, ratingsAverage, summary,difficulty';
  next();
};

// 2) Route Handlers
exports.getAlltours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.updateTour = factory.updateOne(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   await Tour.findByIdAndDelete(req.params.id, (err) => {
//     if (err) return next(new AppError('No tour found with that ID', 404));
//   });

//   res.status(204).json({
//     status: 'succes',
//     data: null,
//   });
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' }, // من الاخر الحته دي كانها بتقولك انت عاوز تعمل جروب علي اي اساس السعر ولا الصعوبه ولا اي
        numTours: { $sum: 1 }, // all of this $ are called mongo operator
        numRating: { $sum: '$ratingQuantity' },
        avgRating: { $avg: '$ratingAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } }, // هات كل النتائج بس ميكونش فيهم الي easy
    // },
  ]);

  res.status(200).json({
    status: 'succes',
    data: {
      stats: stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // year we want here is 2021
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates', // we have one document for each of the dates
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tourName: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' }, // هنا حط خانه جديده قيمتها هي قيمه الي id
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
  ]);

  res.status(200).json({
    status: 'succes',
    data: {
      plan,
    },
  });
});
