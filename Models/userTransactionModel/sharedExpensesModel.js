const mongoose = require('mongoose');

const sharedExpensesSchema = new mongoose.Schema({
    groupId:{
        type: String,
        required: true
    },
    expenseId:{
        type: String,
        required: true
    },
    dateOfExpense:{
        type: Date,
        default: Date.now
    },
    netAmount:{
        type: Number,
        required: true
    }
});

module.exports.sharedExpensesSchema = mongoose.model("SharedExpenses", sharedExpensesSchema);
