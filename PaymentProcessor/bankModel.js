// This acts like a bank.
// has the following functions:
// 1. validCard: checks if the card is valid or not
// 2. fetchCardBalance: fetches the balance of the card
// 3. debitAmountFromCard: debits the amount from the card
// 4. creditAmountToCard: credits the amount to the card

const userAccountModel = require('../Models/userAccountModel');

const createBankAccount = async (name, email, cardDetails) => {
    let defaultBalance = 1000;
    try{
        const account = new userAccountModel({
            name: name,
            email: email,
            cardDetails: cardDetails,
            balance: defaultBalance
        });
        let response = await account.save();
        if(response.error){
            return false;
        }
    } catch(error){
        console.log(error);
        return false;
    }
    return true;
}

// checking validity of the card
const validCard = async (card) => {
    try{
        const account = await userAccountModel.findOne({"cardDetails.cardNumber": card.cardNumber});
        if(!account){
            return false;
        }

        // check the expiry date
        const expiryDate = new Date(account.cardDetails.expiryDate);
        const currentDate = new Date();

        if(expiryDate.getFullYear() < currentDate.getFullYear() ||
            (expiryDate.getFullYear() === currentDate.getFullYear() 
            && expiryDate.getMonth() < currentDate.getMonth())){
            return false;       
        }
    } catch(error) {
        console.log(error);
        return false;
    }
    return true;
};

// fetch the balance of the card
const fetchCardBalance = async (card) => {
    try{
        const account = await userAccountModel.findOne({"cardDetails.cardNumber": card.cardNumber});
        return account.balance;
    } catch(error){
        console.log(error);
        return -1;
    }
};

// debit the amount from the user's card
const debitAmountFromCard = async (card, amount) => {
    try{
        const currentBalance = await fetchCardBalance(card);
        // deduct the amount from the user
        const updatedAmount = currentBalance - amount;
    
        const result = await userAccountModel.updateOne({"cardDetails.cardNumber": card.cardNumber}, {balance: updatedAmount});
        if(result.error){
            console.log(result.error);
            return false;
        }
    } catch(error){
        console.log(error);
        return false;
    }

    return true;
};

// credit the amount to the user's card
const creditAmountToCard = async (card, amount) => {
    try{
        const currentBalance = await fetchCardBalance(card);
        // credit the amount to user's card
        const updatedAmount = currentBalance + amount;
        const result = await userAccountModel.updateOne({"cardDetails.cardNumber": card.cardNumber}, {balance: updatedAmount});
        if(result.error){
            console.log(result.error);
            return false;
        }
    } catch(error){
        console.log(error);
        return false;
    }

    return true;
};


module.exports = {createBankAccount, validCard, fetchCardBalance, debitAmountFromCard, creditAmountToCard};