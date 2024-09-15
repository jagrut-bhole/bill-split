const User = require("../models/user");
const Group = require("../models/group");
const { default: mongoose } = require("mongoose");
const Expense = require("../models/expense");

const { sendMail } = require("../utils/mailer");

module.exports.expenseDetail_get = async (req, res) => {
  try {
    const expenseId = req.query.id;

    // Ensure the ID is valid
    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      return res.status(400).send("Invalid Expense ID");
    }

    // Fetch the expense and populate the related fields
    const expense = await Expense.findById(expenseId)
      .populate("owner", "name username email") // Populate owner details
      .populate("members", "name username email") // Populate members details
      .populate("group members")
      .populate({
        path: "group",
        populate: {
          path: "members",
          select: "name username email",
        }, // Populate group members
      }); // Populate both group and its members

    if (!expense) {
      return res.status(404).send("Expense Not Found");
    }

    // console.log("Fetched Expense:", expense);
    // console.log("Group in Expense:", expense.group);

    if (!expense.group) {
      res.render("expenseDetails", { expense, group: null });
    } else {
      res.render("expenseDetails", { expense, group: expense.group });
    }
  } catch (error) {
    console.error("Error fetching transaction:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.expenseEdit_post = async (req, res) => {
  try {
    const expenseId = req.params.id;

    // Ensure the ID is valid
    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      return res.status(400).send("Invalid Expense ID");
    }

    // Extract data from the request body
    const { name, amount, members } = req.body;

    // Find and update the expense
    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      { name, amount, members },
      { new: true } // This returns the updated document
    ).populate("members", "name email username");

    if (!updatedExpense) {
      return res.status(404).send("Expense Not Found");
    }

    //loop through the members and send an email to each
    const memberEmails = updatedExpense.members.map((member) => member.email);
    const owner = updatedExpense.owner.name;
    const emailSubject = `Expense Edited: ${updatedExpense.name}`;
    const emailBody = `
    HELLO,

    The expense '${updatedExpense.name}' has been updated by ${owner}.

    New Expense Amount: INR ${updatedExpense.amount}

    Please Check your balance or contribution accordingly.

    Regards,
    Bill Splitter Team
    `;

    // Send an email to each member
    memberEmails.forEach(async (email) => {
      try {
        await sendMail(email, emailSubject, emailBody);
        console.log(`Email sent to: ${email}`);
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error.message);
      }
    });

    // Redirect to the expense detail page after a successful update
    res.redirect(`/expense/expenseDetails?id=${expenseId}`);
  } catch (error) {
    console.error("Error updating expense:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.expense_delete = async (req, res) => {
  try {
    const expenseId = req.params.id; // Use req.params for route parameters

    // Ensure the ID is valid
    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      return res.status(400).json({ message: "Invalid Expense ID" });
    }

    // Delete the expense from the database
    const deletedExpense = await Expense.findByIdAndDelete(expenseId);

    if (!deletedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
