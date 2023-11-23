const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    members: {
        type: Array,
        default: []
    },
    groupExpensesList:{
        type: Array
    },
    groupTotal: {
        type: Number, 
        default: 0
    },
    settlePeriod:  {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Group', groupSchema);
