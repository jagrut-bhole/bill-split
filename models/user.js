const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
  },
  username: {
    type: String,
    required: [true, "Please enter your username"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Please enter an email"],
    unique: true,
    lowercase: true,
    validate: [isEmail, "Please enter an valid email address"],
  },
  password: {
    type: String,
    required: [true, "Please enter an password."],
    minlength: [6, "Password should be minimum 6 letters long"],
  },
  uniqueId: {
    type: String,
    default: uuidv4, // Automatically generate a UUID when a user is created
    unique: true,
  }
});

//Fire a function after document saved to Database
// userSchema.post("save", function (doc, next) {
//   console.log("new user was created and saved", doc);
//   next();
// });

//Fire a function before document is to be saved to database
userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//static method to login user
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("Incorrect password");
  }
  throw Error("Incorrect email");
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
