const express = require('express');
const tourController = require('./../controllers/tourController'); // هنا في tourController هي عباره عن كل الحاجات الي اتعملها exports ف الفايل التاني

const Router = express.Router();

// Router.param('id', tourController.checkID);
// val will contain the value of the id
// this param will be in the url we specify id cause we need to check it only ..

Router.route('/Top-5-cheap').get(
  tourController.aliasTopTour,
  tourController.getAlltours,
);

Router.route('/tour-stats').get(tourController.getTourStats);
Router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

Router.route('/')
  .get(tourController.getAlltours)
  .post(tourController.createTour); // this will checkbody first then it will create the body if not true it will return 400

Router.route('/:id')
  .get(tourController.getTour) // tourController.gettour علشان نخلي الفانكشن الي احنا عملناها تسمع ف الحاجات دي
  .patch(tourController.UpdateTour)
  .delete(tourController.deleteTour);

module.exports = Router;
