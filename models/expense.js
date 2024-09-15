// models/expense.js
const mongoose = require("mongoose");
const Balance = require('./balance');

const expenseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Fuel", 
        "Food", 
        "Shopping",
        "Bus-Train",
        "Taxi",
        "Groceries",
        "Plane",
        "Rent",
        "Medical-expense",
        "Gifts",
        "Bill",
        "Taxes",
        "Cleaning",
        "Clothing",
        "Liquor",
        "Maintenance",
        "Other",
      ],
    },
  },
  { timestamps: true }
);

// Helper function to ensure Balance document and array entries exist
async function ensureBalanceEntry(userId, groupId, arrayName, counterpartyId) {
  // Try to find the Balance document
  let balance = await Balance.findOne({ user: userId, group: groupId });

  if (!balance) {
    // If it doesn't exist, create a new one
    balance = new Balance({
      user: userId,
      group: groupId,
      owes: [],
      owedBy: [],
    });
  }

  // Check if the array (owes or owedBy) contains an entry for the counterparty
  const array = balance[arrayName];
  const entryExists = array.some((entry) => entry.toString() === counterpartyId.toString());

  if (!entryExists) {
    // If not, add a new entry
    array.push({
      [arrayName === "owes" ? "to" : "from"]: counterpartyId,
      amount: 0,
    });
  }

  // Save the balance document
  await balance.save();
}

expenseSchema.post("save", async function (expense, next) {
  try {
    const splitAmount = expense.amount / expense.members.length;

    for (const memberId of expense.members) {
      if (!memberId.equals(expense.owner)) {
        // Ensure Balance entries exist
        await ensureBalanceEntry(expense.owner, expense.group, "owedBy", memberId);
        await ensureBalanceEntry(memberId, expense.group, "owes", expense.owner);

        // Update the owner's Balance document
        await Balance.updateOne(
          { user: expense.owner, group: expense.group, "owedBy.from": memberId },
          {
            $inc: { "owedBy.$.amount": splitAmount },
          }
        );

        // Update the member's Balance document
        await Balance.updateOne(
          { user: memberId, group: expense.group, "owes.to": expense.owner },
          {
            $inc: { "owes.$.amount": splitAmount },
          }
        );
      }
    }

    next();
  } catch (error) {
    console.error("Error in post-save middleware:", error);
    next(error);
  }
});

module.exports = mongoose.model("Expense", expenseSchema);