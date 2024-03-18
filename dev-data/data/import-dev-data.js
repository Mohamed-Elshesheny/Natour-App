const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv'); // we need dotenv to connect to the db
const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' }); // this will read the env_variables from the file and import it to the node.js env

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

// read JSON filen

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'),
);

// import data into db

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// delete all data from db

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
