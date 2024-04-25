const dotenv = require('dotenv');
const mongoose = require('mongoose');
const portfinder = require('portfinder');
dotenv.config({ path: './config.env' }); // this will read the env_variables from the file and import it to the node.js env

const app = require('./app');

const DB = process.env.DATABASE.replace(
  // This is for read the hosted data base form config.env and replace password
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    // this is for some property he will teach it us later on
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB conections is successfully'))
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
  });

// server
// const port = 300;
// app.listen(port, () => {
//   console.log(`App is running on port ${port}`);
// });
portfinder
  .getPortPromise()
  .then((port) => {
    // Start the server on the dynamically assigned port
    app.listen(port, () => {
      console.log(`App is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Error finding an available port:', err);
  });
