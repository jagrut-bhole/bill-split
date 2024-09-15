var express = require("express");
var router = express.Router();
const { requireAuth, checkUser } = require("../middleware/authmiddleware");
const Group = require("../models/group");
const User = require("../models/user");
const { default: mongoose } = require("mongoose");

router.get("*", checkUser);

/* GET home page*/
router.get('/', (req, res) => {
  if (req.useragent.isMobile) {
      // Serve mobile version of the page
      res.render('mobile-landing');
  } else {
      // Serve desktop version of the page
      res.render('desktop-landing');
  }
});

/* GET profile page. */
router.get("/profile", requireAuth, (req, res) => {
  res.render("profile");
});


router.get("/trial", (req,res) => {
  res.render("trial");
});

router.get("/t2",(req,res) => {
  res.render("mobile-landing");
});

router.get('/contact-us', (req,res) => {
  res.render("contact")
});

module.exports = router;
