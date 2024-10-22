const Expense = require("../models/expense");
const moment = require("moment");

const Group = require("../models/group");

module.exports.getGroupSpending = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(400).send("User not authenticated");
    }

    const userId = req.user._id; // Assuming you're using JWT and have user authentication

    // Fetch group spending data for the logged-in user
    const groups = await Group.find({ members: userId }).populate("expenses");

    const groupSpending = groups.map((group) => {
      const totalSpent = group.expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );
      return { groupName: group.name, totalSpent };
    });

    const labels = groupSpending.map((g) => g.groupName);
    const values = groupSpending.map((g) => g.totalSpent);

    res.json({ label: "Group Spending", labels, values });
  } catch (error) {
    console.error("Error fetching group spending data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.getMonthlySpending = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(400).send("User not authenticated");
    }

    console.log("req.user:", req.user);

    const userId = req.user._id; // Get user ID from the request

    // Fetch last month's spending as before
    const startOfMonth = moment()
      .subtract(1, "month")
      .startOf("month")
      .toDate();
    const endOfMonth = moment().subtract(1, "month").endOf("month").toDate();

    const expenses = await Expense.find({
      owner: userId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const totalSpent = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    res.json({
      label: "Last Month's Spending",
      labels: ["Last Month"],
      values: [totalSpent],
    });
  } catch (error) {
    console.error("Error fetching monthly spending:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
