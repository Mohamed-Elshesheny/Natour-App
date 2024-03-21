const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const GlobalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./Routes/toursRoute');
const userRouter = require('./Routes/userRoutes');

const app = express();

// 1) Middleware
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  // لما تكون في حاله التطوير وانت فاتح البرنامج علي اساس انو تطوير هيبان معاك حاله الي الدخول
  //   دا لما تكون حاله التطبيق في مرحله التطوير استخدم
  app.use(morgan('dev')); // When you use Morgan, it automatically logs details about incoming HTTP requests
}
app.use(express.json());

app.use(express.static(`${__dirname}/public`)); // we use static insted of fs.readfile cuase we read html and css and js files

// app.use((req, res, next) => {
//   // middle ware
//   console.log('Hello from the middleware ');
//   next(); // we need to call this next() so that it wont be stack in the middleware and move on
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Routes all of these routes handlers from express package
app.use('/api/v1/tours', tourRouter); // This route runs first cause it's in the midddleware queue
app.use('/api/v1/users', userRouter); // And if the route isn't right he will run the app.all

app.all('*', (req, res, next) => {
  // url error handler
  // this app.all select routes that we arent handled yet and '*' get all routes

  next(new AppError(`can't find this ${req.originalUrl} on this server!`, 404)); // he will go to the error handler
});

// This is an error handler from express when we write with 4 paramters it knows it's for error handling
app.use(GlobalErrorHandler);

module.exports = app;
