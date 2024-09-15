const Group = require("../models/group");
const { default: mongoose } = require("mongoose");
const User = require("../models/user");
const Expense = require("../models/expense");
const Balance = require("../models/balance")

const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { sendMail } = require("../utils/mailer");
require("dotenv").config();

module.exports.group_get = async (req, res) => {
  try {
    const groupId = req.query.id;
    const user = req.user;

    // Validate groupId before querying the database
    if (!groupId) {
      return res.status(404).send(`<h1>GroupId is Required</h1>`);
    }

    console.log("Group ID:", groupId);
    console.log("User ID:", user._id);

    const group = await Group.findById(groupId)
      .populate({
        path: "expenses",
        populate: [
          {
            path: "owner",
            select: "username email",
          },
          {
            path: "members",
            select: "username email",
          },
        ],
      })
      .populate({
        path: "createdBy",
        select: "email",
      })
      .populate("members", "username email name")
      .populate("expenses");

    // console.log("Fetched Group:", group);

    if (!user) {
      return res.status(404).send(`<h1>User Not Found</h1>`);
    }

    if (!group) {
      return res.status(404).send(`<h1>Group Not Found</h1>`);
    }

    // Initialize totals
    let totalExpense = 0;
    let balances = {};

    // Calculate total expense and balances
    group.expenses.forEach((expense) => {
      totalExpense += expense.amount;

      const splitAmount = expense.amount / expense.members.length;

      expense.members.forEach((member) => {
        if (!balances[member._id]) {
          balances[member._id] = { owed: 0, owes: 0 };
        }

        if (member._id.equals(expense.owner._id)) {
          balances[member._id].owed += expense.amount - splitAmount;
        } else {
          balances[member._id].owes += splitAmount;
        }
      });
    });

    // Get the current user's balance summary
    const userBalance = balances[user._id] || { owed: 0, owes: 0 };

    // Fetch balances for this user
    const balanceData = await Balance.findOne({ user: user._id, group: groupId });

    res.render("group", {
      group,
      user,
      totalExpense,
      userOwed: userBalance.owed,
      userOwes: userBalance.owes,
      balanceData,
    });
  } catch (error) {
    console.log("Error fetching the group", error.message);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.group_post = async (req, res) => {
  try {
    console.log(req.body); // Log the request body
    const { groupName, description, currency, category } = req.body;

    if (!groupName) throw new Error("Group name is required!!");
    if (!description) throw new Error("Description is required!!");
    if (!currency) throw new Error("Currency is required!!");
    if (!category) throw new Error("Category is required!!");

    const newGroup = new Group({
      name: groupName,
      description,
      currency,
      category,
      createdBy: req.user._id,
      members: [req.user._id],
    });

    await newGroup.save();
    // res.redirect('/group?id=${newGroup._id}'); //replace by just ``
    res.redirect("/dashboard");
  } catch (err) {
    console.error("Error in creating the group: ", err);
    res.status(500).send("Server Error");
  }
};

module.exports.group_delete = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user._id;

    console.log("Group Id:", groupId);
    console.log("User Id:", userId);

    //Ensuring the group is valid
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      console.log("Invalid GroupId");
      return res.status(404).json({
        success: false,
        message: "Group not found. or Invalid GroupId",
      });
    }

    // Find the group to make sure the current user has permission to delete it

    const group = await Group.findOne({ _id: groupId, createdBy: userId });
    if (!group) {
      console.log("Group not found or user has no permission to delete it");
      return res.status(404).json({
        success: false,
        message:
          "Group not found or you do not have permission to delete this group.",
      });
    }

    //Delete the group
    await Group.findByIdAndDelete(groupId);
    console.log("Group deleted successfully");
    res.json({ success: true });
  } catch (error) {
    console.log("Error in deleting group:", error);
    res.stauts(500).json({ success: false, message: "Server Error" });
  }
};

module.exports.invite_post = async (req, res) => {
  try {
    const { email, message, groupId } = req.body;

    // Check if the user already exists
    let user = await User.findOne({ email });
    if (!user) {
      //If user doesn't exist create an invite token
      const token = crypto.randomBytes(20).toString("hex");

      //Sending the invitation mail
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const inviteUrl = `${req.protocol}://${req.get(
        "host"
      )}/signup?token=${token}&groupId=${groupId}`;

      const mailOptions = {
        to: email,
        from: process.env.EMAIL_USER,
        subject: "Invitation to join your group",
        text: `Please click th following link to join the group:\n\n ${inviteUrl}`,
      };

      await transporter.sendMail(mailOptions);

      res.status(200).send("Invitation Sent SuccessFully");
    } else {
      //If user already exists

      const group = await Group.findById(groupId);
      if (group.members.includes(user._id)) {
        return res.status(400).send("User is already a member of that group.");
      }
      group.members.push(user._id);
      await group.save();

      // Notify the existing user via email
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      const mailOptions = {
        to: email,
        from: process.env.EMAIL_USER,
        subject: "You have been added to a group",
        text: `${message}\n\nYou have been added to the group "${group.name}".`,
      };

      await transporter.sendMail(mailOptions);

      res.status(200).send("User added to the group successfully.");
    }
  } catch (err) {
    console.error("Error in sending the invitation: ", err);
    res.status(500).send("Server Error");
  }
};

module.exports.accept_invitation_get = async (req, res) => {
  try {
    const { groupId, userId } = req.query;

    // validating groupId and userId
    if (
      !mongoose.Types.ObjectId.isValid(groupId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(404).send("Invalid Invitation");
    }

    // Checking if user is already a member
    const user = await User.findById(userId);
    if (group.members.includes(userId)) {
      return res.redirect(`/group?id=${groupId}`);
    }

    // Checking if group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).send("Group Not Found");
    }

    // Add the user to group members
    group.members.push(userId);
    await group.save();

    // Redirect to the group page
    res.redirect(`/group?id=${groupId}`);
  } catch (error) {
    console.error("Error in accepting invitation: ", error);
    res.status(500).send("Server Error");
  }
};

module.exports.accept_invitation_groupId_get = async (req, res) => {
  try {
    const { groupId } = req.query;
    const userId = req.user._id;

    //find group by id
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).send("Group not Found.");
    }

    // Add the user to the group's member array if they are'nt already a member

    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
    }

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error accepting invitation:", error);
  }
};

module.exports.addExpense_post = async (req, res) => {
  try {
    console.log(req.body);

    let {
      groupId: groupId,
      description,
      name,
      amount,
      date,
      paymentMethod,
      category,
      members,
      ownerId: ownerId,
    } = req.body;

    // ownerId should be taken single so defining the first element ot backend
    if (Array.isArray(ownerId)) {
      ownerId = ownerId[0];
    }

    // Check that ownerId is a single value and valid
    if (!ownerId) {
      return res.status(400).send("Invalid ownerId");
    }

    const newExpense = new Expense({
      name,
      description,
      amount,
      date,
      paymentMethod,
      category,
      members,
      group: groupId,
      owner: ownerId,
    });

    const savedExpense = await newExpense.save();
    // Find the group and populate the necessary fields
    const group = await Group.findById(groupId)
      .populate({
        path: "expenses.owner",
        select: "username",
      })
      .populate({
        path: "expenses.members",
        select: "username",
      })
      .populate({
        path: "members",
        select: "email name",
      });

    if (!group) {
      return res.status(404).send("Group Not Found");
    }

    group.expenses.push(savedExpense._id);
    await group.save();

    // Sending email to each member in expense except the owner
    const emailPromises = group.members
      .filter((member) => String(member._id) !== String(ownerId))
      .map(async (member) => {
        const subject = `New Expense added to Group: ${group.name}`;
        const text = `
        HELLO,

        ${savedExpense.owner.name} added a new Expense (${savedExpense.name}) of INR ${savedExpense.amount} in ${group.name} group.


        Please check your balance or contribution accordingly

        Regards,
        Bill Splitter Team
        `;

        return sendMail(member.email, subject, text)
          .then(() => console.log(`Email sent to ${member.email}`))
          .catch((error) =>
            console.log(`Failed to send email to ${member.email}:`, error)
          );
      });

    res.redirect(`/group?id=${groupId}`);
  } catch (err) {
    console.log("Error adding expense:", err);
    res.status(500).send("Internal Server Error");
  }
};
