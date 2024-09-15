const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/user");

const requireAuth = async (req, res, next) => {
  const token = req.cookies.jwt; // Assuming you're using cookies for JWT

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        console.log("Error verifying token:", err);
        return res.redirect("/login");
      } else {
        try {
          const user = await User.findById(decodedToken.id);
          if (!user) {
            return res.redirect("/login");
          }
          req.user = user;
          next();
        } catch (err) {
          console.error("Error fetching user:", err);
          return res.redirect("/login");
        }
      }
    });
  } else {
    res.redirect("/login");
  }
};

//checking current user
const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        // console.log(err.message);
        res.locals.user = null;
        next();
      } else {
        // console.log(decodedToken);
        let user = await User.findById(decodedToken.id);
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

module.exports = { requireAuth, checkUser };
