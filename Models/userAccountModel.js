const mongoose = require('mongoose');

// const creditCardModel = require('./creditCardModel');

const creditCardModel = new mongoose.Schema({
    cardNumber: {
        type: String,
        required: true
    },
    cardHolderName:{
        type: String,
        required: true
    },
    expiryDate:{
        type: Date,
        required: true
    },
    cvv:{
        type: Number,
        required: true
    }
});

const userAccountSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    cardDetails: {
        type: creditCardModel,
        required: true
    },
    balance: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('UserAccount', userAccountSchema);