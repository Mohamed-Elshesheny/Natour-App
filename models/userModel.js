const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { parse } = require('dotenv');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name.!'],
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a vaild email'], // all of these vaildator on document
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
    //unique: true,
  },
  passwordconfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // this only work on CREATE and SAVE!! can't work with update etc.
      validator: function (el) {
        return el === this.password;
      },
      message: 'The passwords are not the same',
    },
  },
  passwordChangedAt: Date,
});

userSchema.pre('save', async function (next) {
  // This line will actually run only if the password was modified
  if (!this.isModified('password')) return next();
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // Delete the password-confirm field
  this.passwordconfirm = undefined;
});

userSchema.methods.correctPassword = async function (
  candiatePassword,
  userPassword,
) {
  return await bcrypt.compare(candiatePassword, userPassword); // اول خانه دا الباص الي اليوزر هيدخلو التاني الباص الي ف الداتا
  // await bcrypt.compare(candiatePassword, userPassword).then(() => {
  //   console.log('The pass word is right');
  // });
};

userSchema.methods.ChangedPasswordAfter = function (JWTTimestamp) {
  // timestamp is a date when the token was issued
  if (this.passwordChangedAt) {
    const ChangedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    console.log(ChangedTimestamp, JWTTimestamp);
    return JWTTimestamp < ChangedTimestamp; // it means that the password was changed
  }
  // false means that password NOT changed
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
