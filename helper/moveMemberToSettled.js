const Expense = require('../Models/expenseModel');

const moveMemberToSettled = async (groupId, emailToMove) => {
  try {
    const expenses = await Expense.find({ groupId });

    for (const expense of expenses) {
      if (expense.involved.includes(emailToMove)) {
        // Move the email from involved to settled
        expense.settledby.push(emailToMove);
        expense.involved = expense.involved.filter((email) => email !== emailToMove);
    
        await expense.save();
      }

      // Check if there are no more involved members or if it's the owner and move to settled
      if (expense.involved.length === 0 || (expense.involved.length === 1 && expense.involved[0] === expense.ownerOfExpense)) {
        expense.settledby.push(...expense.involved);
        expense.involved = [];
        await expense.save();
      }
    }

    console.log('Member moved to settled successfully from group expenses.');
  } catch (error) {
    console.error('Error moving member to settled from group expenses:', error);
  }
};

module.exports = moveMemberToSettled;
