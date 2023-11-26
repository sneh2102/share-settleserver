const Group = require('../Models/groupModel');

const makeSettlement = async(req) =>{
    res = {};
    try{
        const group = await Group.findOne({
            _id: req.body.id
        });


        if (!group) {
            let err = new Error("Invalid Group Id");
            err.status = 400;
            throw err;
        }
       
       group.groupExpensesList[0][req.body.From] += req.body.Amount
       group.groupExpensesList[0][req.body.To] -= req.body.Amount

       let update_response = await Group.updateOne({_id: group._id}, {$set:{groupExpensesList: group.groupExpensesList}})

       res = {
            message: "Settlement successfully!",
            status: "Success",
            update: update_response,
            response: group._id
        };

    }catch (err) {
        res = {
            message: err.message
        };
    }
    return res;
}

module.exports = {makeSettlement};