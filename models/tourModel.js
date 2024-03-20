const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    // the schema is how we constracting our data
    // here we define our DB schema for save the data then will do the CRUD operations with mongoose model
    name: {
      type: String,
      required: [true, 'A tour must have a name'], // here we define the error if he didnt put his name
      unique: true, // we constract unique property so that we dont have the same name twice in the db
      trim: true,
      maxlength: [40, 'Tour name must have less than or equal to 40 character'],
      minlength: [10, 'Tour name must have more than or equal to 10 character'],
      //validate: [validator.isAlpha, 'Tour name must contain only character'], // its from the library
    },
    slug: String,
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
      enum: {
        // we cant wirte the error message like above cause its a shorthand of the below method
        values: ['easy', 'medium', 'difficult'],
        message: ' Difficulty either be: easy,meduim,difficlt',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'], // if the user wont put a rating we set here the default valuo
      max: [5, 'Rating must be below 5.0'],
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document CREATION NOT ON [UPDATE]
          return val < this.price;
        },
        message: 'Discount must be below the regular price ({VALUE})', // ({VALUE}) this is in monogo things will put it with the value the user input it
      },
    },
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
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true }, // to make the output of virtuals apper in the db
    toObject: { virtuals: true },
  },
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7; // assuming duration is in days, dividing by 7 to get weeks
});

//Document Middleware: runs before .save and . create - this middleware is gonna run berfore the actual event
tourSchema.pre('save', function () {
  this.slug = slugify(this.name, { lower: true }); // this is the currently working document
});

//This is the real document that shows in the web
// tourSchema.post('save', function (doc, next) { // doc: This parameter represents the document that was just saved to the database.
//   console.log(doc);
//   next();
// });

//QUERY Middelware
tourSchema.pre(/^find/, function (next) {
  //This means it will be executed before any query operation that starts with 'find'. cause of (pre)
  // (/^find/) this include all strings starts with (find) to write it to trigger this function
  // we are know pointing into the current query
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} miilleseconds`);
  //console.log(docs);
  next();
});

//AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  //console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema); // mongoose model to use CRUD operations

module.exports = Tour;
