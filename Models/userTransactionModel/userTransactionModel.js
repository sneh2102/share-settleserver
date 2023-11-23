const mongoose  = require('mongoose');

const userTransactionSchema = new mongoose.Schema({
    fromUser: {
        type: String,
        required: true
    },
    toUser: {
        type: String,
        required: true
    },
    sharedExpenses: {
        type: Array,
        default: []
    },
    totalAmount: {
        type: Number,
        required: true
    }
});

module.exports.userTransactionSchema = mongoose.model("UserTransaction", userTransactionSchema);