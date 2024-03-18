const Tour = require('./../models/tourModel');
const APIfeatures = require('./../utils/apiFeatures');

exports.aliasTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name, price, ratingsAverage, summary,difficulty';
  next();
};

// 2) Route Handlers
exports.getAlltours = async (req, res) => {
  try {
    // excute query
    const features = new APIfeatures(Tour.find(), req.query) // we create a new object of the class
      .filter()
      .sort()
      .limitFields()
      .pagination();
    const tours = await features.query;

    // send the response
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: tours.length,
      data: {
        tours: tours, // in E63 we can have key-value withot '' if they have the same name...
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fails',
      massage: err,
    });
  }
};
exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id); // this findbyid to find a sepecific tour by his id
    // Tour.findOne({ _id:req.params.id}) this will do the same work up there
    // the propaperty we search for and the value of it
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fails',
      massage: err,
    });
  }
  // find() it is a bulit in fun in js to loop in the array to find an element and then create an array with this element.
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'succes',
      data: {
        tours: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fails',
      massage: err,
    });
  }
  // const newTour = new Tour({});
  // newTour.save(); the old way
};
// we can not send two responses....

exports.UpdateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'succes',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fails',
      massage: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'succes',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fails',
      massage: err,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fails',
      massage: err,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fails',
      massage: err,
    });
  }
};
