const Group = require("../Models/groupModel");
const Expense = require("../Models/expenseModel");
const User = require("../Models/userModel");
const notificationHandler = require('../helper/NotificationHandler');
const splitCalculator = require('../helper/spliting');
const moveMemberToSettled = require('../helper/moveMemberToSettled');
const scheduler = require('../helper/scheduler');
const dateConversion = require('../helper/dateConversion');
const { get } = require("lodash");

// create a new group
const createGroup = async (req, res) => {
    const {jobForSettlement, jobForEmailNotification}=scheduler;
    const {calculatePeriodFromString, getDate, getNumberOfDays}=dateConversion;
    
    let responseStatus = 200;
    let response = {};
    if(!req.body ||!req.body.name || !req.body.members || !req.body.settlePeriod){
        responseStatus = 404;
        response = { 
            errorMessage: "Invalid request body"
        };
    } else {
        const group = new Group({
            name: req.body.name,
            members: req.body.members,
            settlePeriod: req.body.settlePeriod
        });
        let splitJson = {}

            for (let user of group.members) {
                splitJson[user] = 0
            }
            group.groupExpensesList = splitJson
            
        
        try {
            const savedGroup = await group.save();

            const groupName = savedGroup.name;

            // scheduler for settlement
            jobForSettlement(savedGroup.settlePeriod, savedGroup._id);
            const action = 'groupCreation';

            // get the number of days for scheduler reminder notification
            let parts = savedGroup.settlePeriod.split(" ");
            let numerical = parseInt(parts[0]);
            let unit = parts[1].toLowerCase();

            // notification 2 days before the settlement period
            let daysToRepeat = getNumberOfDays(numerical, unit) - 2;
            jobForEmailNotification(daysToRepeat, unit ,savedGroup._id);

            for (const member of savedGroup.members) {
                const user = await User.findOne({email: member});
                if (user && user.email) {
                    const param={
                     email: user.email, 
                     user1: user.name, 
                     groupName: groupName, 
                     action: 'groupCreation',
                     user2: null, 
                     Status: null,
                     amount: null,
                     date: null}
                    
                   await notificationHandler(param);
                }
            }

            response = savedGroup;
        } catch (err) {
           
            responseStatus = 500;
            response = {
                errorStatus: 500, 
                errorMessage: "Internal server error", 
                cause: "Error while saving group"
            };
        }
    }
    res.status(responseStatus).send(response);
};

// fetch all groups of a user by user email
const fetchUserGroups = async (req, res) => {

    let responseStatus = 200;
    let response;
    if(!req.body && !req.body.email){
        responseStatus = 404;
        response = {
            errorMessage: "Invalid request body"
        };
    } else{
        try{
            const queryResults = await Group.find({"members": req.body.email});
            response = {
                groups: queryResults
            };
        } catch(err) {
            
            responseStatus = 500;
            response = {
                errorStatus: 500, 
                errorMessage: "Internal server error", 
                cause: "Error while fetching user groups"
            };
        }
    }
    res.status(responseStatus).send(response);
}

const fetchGroup = async (req, res) => {
    const { id } = req.params;
    let responseStatus = 200;
    let response;
        try{
            const queryResults = await Group.findById(id);
            response = {
                group: queryResults
            };
            
        } catch(err) {
            
            responseStatus = 500;
            response = {
                errorStatus: 500, 
                errorMessage: "Internal server error", 
                cause: "Error while fetching user groups"
            };
        }
    res.status(responseStatus).send(response);
}


const clearExpenseList = async (groupId, amount, ownerOfExpense, involved) => {
    let group = await Group.findOne({
        _id: groupId
    })
    group.groupTotal -= amount
    group.groupExpensesList[0][ownerOfExpense] -= amount
    expenseDistribution = amount / involved.length
    expenseDistribution = Math.round((expenseDistribution + Number.EPSILON) * 100) / 100;

    for (let user of involved) {
        group.groupExpensesList[0][user] += expenseDistribution
    }

    let bal=0
    for(val of Object.entries(group.groupExpensesList[0]))
    {
        bal += val[1]
    }
    group.groupExpensesList[0][ownerOfExpense] -= bal
    group.groupExpensesList[0][ownerOfExpense] = Math.round((group.groupExpensesList[0][ownerOfExpense]  + Number.EPSILON) * 100) / 100;
    
    return await Group.updateOne({
        _id: groupId
    }, group)
}


const addExpenseList = async (groupId, amount, ownerOfExpense, involved) => {
    let group = await Group.findOne({
        _id: groupId
    })
    group.groupTotal += amount
    group.groupExpensesList[0][ownerOfExpense] += amount
    expenseDistribution = amount / involved.length
    expenseDistribution = Math.round((expenseDistribution  + Number.EPSILON) * 100) / 100;
    
    for (let user of involved) {
        group.groupExpensesList[0][user] -= expenseDistribution
    }
    
    let bal=0
    for(val of Object.entries(group.groupExpensesList[0]))
    {
        bal += val[1]
    }
    group.groupExpensesList[0][ownerOfExpense] -= bal
    group.groupExpensesList[0][ownerOfExpense] = Math.round((group.groupExpensesList[0][ownerOfExpense]  + Number.EPSILON) * 100) / 100;
  
    return await Group.updateOne({
        _id: groupId
    }, group)
}

const groupBalanceSheet = async(req, res) =>{
    try {
        const group = await Group.findOne({
            _id: req.body.id
        })
        
        if (!group) {
            let err = new Error("Invalid Group Id")
            err.status = 400
            throw err
        }
        res.status(200).json({
            status: "Success",
            data: splitCalculator(group.groupExpensesList[0])
        })
    } catch (err) {
        res.status(err.status || 500).json({
            message: err.message
        })
    }
}

const leaveGroup = async (req, res) => {
    try {
      const { email, id } = req.body;
      
  
      const group = await Group.findOne({ members: email, _id: id });
  
      if (!group) {
        return res.status(404).json({ message: 'Group not found for the member.' });
      }
  
      const memberExpense = group.groupExpensesList[0][email];
  
      if (memberExpense !== 0) {
        return res.status(400).json({ message: 'Cannot delete member without settling all the Expenses.' });
      }
  
      const updatedMembers = group.members.filter((memberItem) => memberItem !== email);
  
      const updatedGroup = await Group.findByIdAndUpdate(
        group._id,
        { members: updatedMembers },
        { new: true }
      );
  
      res.json({ message: 'Group left successfully.', group: updatedGroup });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  const makeSettlement = async(req, res) =>{
    try{
        const group = await Group.findOne({
            _id: req.body.id
        })
        const {id,From,To,Amount}=req.body
        if (!group) {
            let err = new Error("Invalid Group Id")
            err.status = 400
            throw err
        }
        
       
       group.groupExpensesList[0][From] += Amount
       group.groupExpensesList[0][To] -= Amount
       
       moveMemberToSettled(id,From)
       
       let update_response = await Group.updateOne({_id: group._id}, {$set:{groupExpensesList: group.groupExpensesList}})

       res.status(200).json({
        message: "Settlement successfully!",
        status: "Success",
        update: update_response,
        response: group._id
    })
    }catch (err) {
        res.status(err.status || 500).json({
            message: err.message
        })
    }
}

module.exports = {createGroup, fetchUserGroups, fetchGroup, addExpenseList,clearExpenseList, groupBalanceSheet, leaveGroup, makeSettlement};