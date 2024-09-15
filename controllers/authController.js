const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

//handle errors
const handleErrors = (err) => {
  //this shows the error in console.log ex- if one wants to make account using same username/email then the err.message shows to user.
  console.log(err.message, err.code);
  let errors = { name: "", username: "", email: "", passowrd: "" };

  //incorrect email
  if (err.message === "Incorrect email") {
    errors.email = "That email is not registered..!";
  }

  //incorrect password
  if (err.message === "Incorrect password") {
    errors.password = "That password is incorrect..!";
  }

  //duplicate error code
  if (err.code === 11000) {
    errors.email = "This email already exists";
    errors.username = "This username already exists. Please try diffrent one";

    return errors;
  }

  //validation errors
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
};

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: maxAge });
};

module.exports.signup_get = (req, res) => {
  res.render("signup");
};

module.exports.login_get = (req, res) => {
  res.render("login");
};

module.exports.signup_post = async (req, res) => {
  const { name, username, email, password } = req.body;

  try {
    const user = await User.create({ name, username, email, password });
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.logout_get = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};