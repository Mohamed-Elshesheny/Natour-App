module.exports = (fn) => {
  return (req, res, next) => {
    // Execute the function and handle both synchronous and asynchronous errors
    Promise.resolve(fn(req, res, next)).catch(next); // Pass any errors to the global error handler
  };
};
// this function is to catch the error insted of try and catch block to make to more maintable andn easy to read
