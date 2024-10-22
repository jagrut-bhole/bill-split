const express = require("express");
const router = express.Router();
const User = require("../models/user");

const dashboardController = require("../controllers/dashboardController");
const { requireAuth } = require("../middleware/authmiddleware");

router.get("/", requireAuth, dashboardController.dashboard_get);

module.exports = router;
