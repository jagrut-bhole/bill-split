const mongoose = require("mongoose");

const balanceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    owes: [
      {
        to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        amount: { type: Number, default: 0 },
      },
    ],
    owedBy: [
      {
        from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        amount: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Balance", balanceSchema);
