const express = require('express');
const morgan = require('morgan');
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

app.use((req, res, next) => {
  // middle ware
  console.log('Hello from the middleware ');
  next(); // we need to call this next() so that it wont be stack in the middleware and move on
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
