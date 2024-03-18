const dotenv = require('dotenv');
const mongoose = require('mongoose');
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
  .then(() => console.log('DB conections is successfully'));

// server
const port = 3000;
app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
