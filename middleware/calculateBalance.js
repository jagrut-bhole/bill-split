const Balance = require('../models/balance');
const Expense = require('../models/expense'); // Assuming you have an Expense model

async function calculateBalance(groupId) {
  const expenses = await Expense.find({ groupId });
  const balances = {};

  expenses.forEach(expense => {
    const totalAmount = expense.amount;
    const numParticipants = expense.participants.length;

    expense.participants.forEach(participant => {
      if (!balances[participant.userId]) {
        balances[participant.userId] = { owedTo: {}, owedBy: {} };
      }

      const amountPerPerson = totalAmount / numParticipants;

      if (participant.userId === expense.ownerId) {
        return; // Skip if the participant is the owner
      }

      if (!balances[participant.userId].owedBy[expense.ownerId]) {
        balances[participant.userId].owedBy[expense.ownerId] = 0;
      }
      if (!balances[expense.ownerId].owedTo[participant.userId]) {
        balances[expense.ownerId].owedTo[participant.userId] = 0;
      }

      balances[participant.userId].owedBy[expense.ownerId] += amountPerPerson;
      balances[expense.ownerId].owedTo[participant.userId] += amountPerPerson;
    });
  });

  return balances;
}

module.exports = { calculateBalance };
