const mongoose = require('mongoose');
const userModel = require("../Models/userModel");
const bankModel = require("../PaymentProcessor/bankModel");
const {validCard, fetchCardBalance, debitAmountFromCard, creditAmountToCard} = bankModel;

// request has information about from user and to user and the amount.
const processPayment = async (req) => {
    console.log(req.body)
    let res = {};
    // if the request doesn't have all required fields then return error
    if(!req || !req.body || !req.body.sender || !req.body.receiver || !req.body.amount){
        res = {
            error:{
                errorCode: "40001",
                errorMessage: "request body is missing required fields"
            }
        };
        return res;
    }

    const body = req.body;
    const sender = body.sender;
    const receiver = body.receiver;
    const amountToSend = body.amount;

    // retrieving user's card details
    const senderCard = await fetchCard(sender);
    const receiverCard = await fetchCard(receiver);
    
    // check if the card details are valid
    const validSenderCard = await validCard(senderCard);
    if(!validSenderCard){
        res = {
            sender: sender,
            receiver: receiver,
            error:{
                errorCode: "40002",
                errorMessage: "invalid sender card"
            }
        };
        return res;
    }

    const validReceiverCard = await validCard(receiverCard);
    if(!validReceiverCard){
        res = {
            sender: sender,
            receiver: receiver,
            error:{
                errorCode: "40003",
                errorMessage: "invalid receiver card"
            }
        };
        return res;
    }

    // check if the sender has enough balance
    const isBalanceAvailable = await checkBalance(senderCard, amountToSend);
    if(isBalanceAvailable == false){
        res = {
            sender: sender,
            receiver: receiver,
            error:{
                errorCode: "40004",
                errorMessage: "insufficient balance"
            }
        };
        return res;
    }

    console.log(`inititaing debit for ${sender}`);
    const isDebitSuccess = await debitAmountFromCard(senderCard, amountToSend);
    console.log("debit status ", isDebitSuccess);

    if(isDebitSuccess == true){
        console.log(`inititaing credit for ${receiver}`);
        const isCreditSuccess = await creditAmountToCard(receiverCard, amountToSend);
        console.log("credit status", isCreditSuccess);
        
        if(isCreditSuccess == false){
            console.log("error crediting amount");

            console.log(`reverting amount to  ${sender}`);
            // revert if amount to sender when credit fails
            let isRevertSuccessful = await creditAmountToCard(senderCard, amountToSend);

            // retry revert amount until successful, to ensure consistency
            while(isRevertSuccessful == false){
                isRevetSuccessful = await creditAmountToCard(senderCard, amountToSend);
            }

            res = {
                sender: sender,
                receiver: receiver,
                error:{
                    errorCode: "50002",
                    errorMessage: "error crediting amount"
                }
            };
            return res;
        }
    }
    else{
        res = {
            sender: sender,
            receiver: receiver,
            error:{
                errorCode: "50003",
                errorMessage: "error debiting amount",
            }
        };
        return res;
    }

    res = {
        message: "payment processed successfully",
        sender: sender,
        receiver: receiver,
    };
    return res;
};

// fetch user's card details
async function fetchCard(userEmail){
    try{
        const user = await userModel.findOne({email: userEmail});

        if(!user || user.errors){
            console.log("user not found or error fetching card");
            return {};
        }

        const cardDetails = user.creditCardDetails;
        return cardDetails;
    } catch(error){
        console.log(error);
        return {};
    }
}


// get the balance from the database
async function checkBalance(card, amount){
    const balance = await fetchCardBalance(card);
    if(balance < amount){
        console.log("Insufficient balance");
        return false;
    }
    return true;
}

module.exports = {processPayment};