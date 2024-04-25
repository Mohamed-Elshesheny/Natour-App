// module.exports = (fn) => {
//   return (req, res, next) => {
//     // Execute the function and handle both synchronous and asynchronous errors
//     Promise.resolve(fn(req, res, next)).catch(next); // Pass any errors to the global error handler
//   };
// };
// this function is to catch the error insted of try and catch block to make to more maintable andn easy to read
//If fn throws an error, the promise is rejected, and catch(next) is called. This means that the error is passed to the next middleware or error handler in the Express middleware chain.
//By using next, it ensures that the error is passed along to the global error handler (GlobalErrorHandler or similar middleware).
