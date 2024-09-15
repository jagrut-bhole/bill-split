// models/group.js
const mongoose = require("mongoose");
const expenseSchema = require("./expense").schema;

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    category: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    expenses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref:'Expense'
    }],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);
