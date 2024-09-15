const { requireAuth } = require("../middleware/authmiddleware");
const Group = require("../models/group");
const User = require("../models/user");

module.exports.dashboard_get = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all groups where the user is the creator or a member
    const groups = await Group.find({
      $or: [{ createdBy: userId }, { members: userId }],
    }).populate("createdBy");

    if (groups.length > 0) {
      res.render("dashboard", { groups });
    } else {
      res.render("dashboard", { groups: null });
    }
  } catch (err) {
    console.error("Error fetching the groups for dashboard:", err);
    res.status(500).send("Internal Server Error");
  }
};
