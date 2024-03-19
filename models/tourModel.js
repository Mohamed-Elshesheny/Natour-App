const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
  {
    // the schema is how we constracting our data
    // here we define our DB schema for save the data then will do the CRUD operations with mongoose model
    name: {
      type: String,
      required: [true, 'A tour must have a name'], // here we define the error if he didnt put his name
      unique: true, // we constract unique property so that we dont have the same name twice in the db
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a durations'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a grpup size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5, // if the user wont put a rating we set here the default valuo
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true, // trim only works with string only it will removes any white space
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
    startDates: [Date],
  },
  {
    toJSON: { virtuals: true }, // to make the output of virtuals apper in the db
    toObject: { virtuals: true },
  },
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7; // assuming duration is in days, dividing by 7 to get weeks
});

//Document Middleware: runs before .save and . create
tourSchema.pre('save', function () {
  console.log(this); // me
}); // this middleware is gonna run berfore the actual event
const Tour = mongoose.model('Tour', tourSchema); // mongoose model to use CRUD operations

module.exports = Tour;
