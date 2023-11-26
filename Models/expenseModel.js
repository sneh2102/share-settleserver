const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    groupId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
    expenseCurrency: {
        type: String,
        default: "CAD"
    },
    dateOfExpense: {
        type: Date,
        default: Date.now
    },
    category: {
        type: String,
        required: true
    },
    ownerOfExpense: {
        type: String,
        required: true
    },
    involved: {
        type: Array,
        required: true
    },
    expenseDistribution: {
        type: Number,
        required: true
    },
    settledby: {
        type: Array,
        required: true
    }
});


module.exports = mongoose.model("Expense", expenseSchema);