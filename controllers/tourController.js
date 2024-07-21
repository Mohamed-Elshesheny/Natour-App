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

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400,
      ),
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400,
      ),
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
