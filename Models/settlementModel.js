const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema({
    settlingTo: {
        type: String,
        required: true
    },
    settlingFrom: {
        type: String,
        required: true
    },
    settlementAmount: {
        type: Number,
        required: true
    },
    dateOfSettlement: {
        type: Date,
        default: Date.now
    },
    // assuming settlement is associated to a group
    groupId: {
        type: String,
        required: true
    },
    // assuming settlement is associated to list of expenses
    expenseList:{
        type: Array,
        default: []
    },
});

module.exports.settlementSchema = mongoose.model("Settlement", settlementSchema);