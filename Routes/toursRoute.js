const express = require('express');
const tourController = require('./../controllers/tourController'); // هنا في tourController هي عباره عن كل الحاجات الي اتعملها exports ف الفايل التاني
const authController = require('./../controllers/authController');
const reviewRouter = require('./../Routes/reviewRoute');

const Router = express.Router();

// Router.param('id', tourController.checkID);
// val will contain the value of the id
// this param will be in the url we specify id cause we need to check it only ..

// Hint: When you find this url go to the [Review-Router]
Router.use('/:tourId/reviews', reviewRouter);

Router.route('/Top-5-cheap').get(
  tourController.aliasTopTour,
  tourController.getAlltours,
);

Router.route('/tour-stats').get(tourController.getTourStats);
Router.route('/monthly-plan/:year').get(
  authController.protect,
  authController.restricTo('admin', 'lead-guide', 'guide'),
  tourController.getMonthlyPlan,
);

Router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(
  tourController.getToursWithin,
);

Router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

Router.route('/')
  .get(tourController.getAlltours)
  .post(
    authController.protect,
    authController.restricTo('admin', 'lead-guide'),
    tourController.createTour,
  ); // this will checkbody first then it will create the body if not true it will return 400

Router.route('/:id')
  .get(tourController.getTour) // tourController.gettour علشان نخلي الفانكشن الي احنا عملناها تسمع ف الحاجات دي
  .patch(
    authController.protect,
    authController.restricTo('admin', 'lead-guide'),
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restricTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

module.exports = Router;
