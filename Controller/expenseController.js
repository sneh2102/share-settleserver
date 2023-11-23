const Group = require('../Controller/groupController');
const GroupModal=require('../Models/groupModel')
const Expense = require('../Models/expenseModel');


const addExpense = async (req, res) => {
    try {
        var expense = req.body;
        var group = await GroupModal.findOne({
            _id: expense.groupId
        });

        if (!group) {
            var err = new Error("Invalid Group Id");
            err.status = 400;
            throw err;
        }

        expense.expenseDistribution = expense.amount / expense.involved.length;
        
        var newExp = new Expense(expense);
        var newExpense = await Expense.create(newExp);

        var update_response = await Group.addExpenseList(
            expense.groupId,
            expense.amount,
            expense.ownerOfExpense,
            expense.involved
        );
        

        res.status(200).json({
            status: "Success",
            message: "New expenses added",
            Id: newExpense._id,
            splitUpdateResponse: update_response
        });
    } catch (err) {
        res.status(err.status || 500).json({
            message: err.message
        });
    }
};

const deleteExpense = async (req, res) => {
    try {
        var expense = await Expense.findOne({
            _id: req.body.id
        })
        if (!expense) {
            var err = new Error("Invalid Expense Id")
            err.status = 400
            throw err
        }
        var deleteExp = await Expense.deleteOne({
            _id: req.body.id
        })
        
        await Group.clearExpenseList(expense.groupId, expense.amount, expense.ownerOfExpense, expense.involved)

        res.status(200).json({
            status: "Success",
            message: "Expense is deleted",
            response: deleteExp
        })
    } catch (err) {
        res.status(err.status || 500).json({
            message: err.message
        })
    }
}

const viewGroupExpense = async (req, res) => {
    try {
        var groupExpense = await Expense.find({
            groupId: req.body.id
        }).sort({
            dateOfExpense: -1
        })
        if (groupExpense.length == 0) {
            var err = new Error("No expense present for the group")
            err.status = 400
            throw err
        }
        var totalAmount = 0
        for (var expense of groupExpense) {
            totalAmount += expense['expenseAmount']
        }
        res.status(200).json({
            status: "Success",
            expense: groupExpense,
            total: totalAmount
        })
    } catch (err) {
        res.status(err.status || 500).json({
            message: err.message
        })
    }
}

const viewUserExpense = async (req, res) => {
    try {
        const userExpense = await Expense.find({
            $or: [
                { involved: req.body.email },
                { settledby: req.body.email }
              ]

        })
        if (userExpense.length == 0) {
            const err = new Error("No expense present")
            err.status = 400
            throw err
        }
        var totalAmount = 0
        for (var expense of userExpense) {
            totalAmount += expense['expenseDistribution']
        }
        res.status(200).json({
            status: "Success",
            expense: userExpense,
            total: totalAmount
        })

    } catch (err) {
        res.status(err.status || 500).json({
            message: err.message
        })
    }
}
const viewUserGroupExpense = async (req, res) => {
   
    try {
        const userExpense = await Expense.find({
            $or: [
                { involved: req.body.email },
                { settledby: req.body.email },
                {ownerOfExpense: req.body.email}
              ],
            groupId: req.body.id
        })
        
        if (userExpense.length == 0) {
            const err = new Error("No expense present")
            err.status = 400
            throw err
        }
        var totalAmount = 0
        for (var expense of userExpense) {
            totalAmount += expense['expenseDistribution']
        }
        res.status(200).json({
            status: "Success",
            expense: userExpense,
            total: totalAmount
        })

    } catch (err) {
        res.status(err.status || 500).json({
            message: err.message
        })
    }
}
const viewExpense = async (req, res) => {
    try {
        var expense = await Expense.findOne({
            _id: req.body.id
        })
        if (expense.length == 0) {
            var err = new Error("No expense present for the Id")
            err.status = 400
            throw err
        }
        res.status(200).json({
            status: "Success",
            expense: expense
        })
    } catch (err) {
        
        res.status(err.status || 500).json({
            message: err.message
        })
    }
}

const categoryExpense = async (req, res) => {
    try {
        var categoryExpense = await Expense.aggregate([{
                $match: {
                    groupId: req.body.id
                }
            },
            {
                $group: {
                    _id: "$category",
                    amount: {
                        $sum: "$amount"
                    }
                }
            },{ $sort : {"_id" : 1 } }
        ])

        res.status(200).json({
            status: "success",
            data: categoryExpense
        })
    } catch (err) {

        res.status(err.status || 500).json({
            message: err.message
        })
    }
}                           

const monthlyExpense = async (req, res) => {
    try {
        var monthlyExpense = await Expense.aggregate([{
                $match: {
                    groupId: req.body.id
                }
            },
            {
                $group: {
                    _id: {
                        month: {
                            $month: "$dateOfExpense"
                        },
                        year: {
                            $year: "$dateOfExpense"
                        }
                    },
                    amount: {
                        $sum: "$amount"
                    }
                }
            },
            { $sort : {"_id.month" : 1 } }
        ])
        res.status(200).json({
            status: "success",
            data: monthlyExpense
        })
    } catch (err) {
      
        res.status(err.status || 500).json({
            message: err.message
        })
    }
}

const userCategoryExpense = async (req, res) => {
    try {
        var categoryExpense = await Expense.aggregate([
            {
                $match: {
                    $or: [
                        { involved: req.body.user },
                        { ownerOfExpense: req.body.user },
                        {settleby: req.body.user}
                    ]
                }
            },
            {
                $group: {
                    _id: "$category",
                    amount: {
                        $sum: {
                            $cond: {
                                if: {
                                    $or: [
                                        { $in: [req.body.user, ["$involved"]] },
                                        {$in: [req.body.user, ["$settleby"]]},
                                        { $in: [req.body.user, ["$ownerOfExpense"]] }
                                    
                                    ]
                                },
                                then: "$expenseDistribution",
                                then: "$expenseDistribution",
                                else: "$amount"
                            }
                        }
                    }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        res.status(200).json({
            status: "success",
            data: categoryExpense
        });
    } catch (err) {
        res.status(err.status || 500).json({
            message: err.message
        });
    }
};



const userMonthlyExpense = async (req, res) => {
    try {
        var monthlyExpense = await Expense.aggregate([{
                $match: {
                    $or: [

                        {involved: req.body.user} ,
                        {settledby: req.body.user}

                    ]
                }
            },
            {
                $group: {
                    _id: {
                        month: {
                            $month: "$dateOfExpense"
                        },
                        year: {
                            $year: "$dateOfExpense"
                        }
                    },
                    amount: {
                        $sum: "$amount"
                    }
                }
            },
            { $sort : {"_id.month" : 1 } }
        ])
        res.status(200).json({
            status: "success",
            data: monthlyExpense
        })
    } catch (err) {
        res.status(err.status || 500).json({
            message: err.message
        })
    }
}

const recentUserExpenses = async (req, res) => {
    try {
        var recentExpense = await Expense.find({
            $or: [
                {involved: req.body.user},
                {settleby: req.body.user}
            ]
        }).sort({
            $natural: -1  
        }).limit(5);  

        res.status(200).json({
            status: "Success",
            expense: recentExpense
        })
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({
            message: err.message
        })
    }
}

const userDailyExpense = async (req, res) => {
  
    try {
        var dailyExpense = await Expense.aggregate([{
                $match: {
                    $or: [
                        {involved: req.body.user},
                        {settleby: req.body.user}

                    ],
                    dateOfExpense: {
                        $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)), 
                        $lte: new Date()}
                }
            },
            {
                $group: {
                    _id: {
                        date: {
                            $dayOfMonth: "$dateOfExpense"
                        },
                        month: {
                            $month: "$dateOfExpense"
                        },
                        year: {
                            $year: "$dateOfExpense"
                        }
                    },
                    amount: {
                        $sum: "$amount"
                    }
                }
            },
            { $sort : {"_id.month" :1, "_id.date" : 1  } }
        ])
    
        res.status(200).json({
            status: "success",
            data: dailyExpense
        })
    } catch (err) {
        res.status(err.status || 500).json({
            message: err.message
        })
    }
}



module.exports = { addExpense, deleteExpense, viewGroupExpense, viewUserExpense , viewExpense, viewUserGroupExpense, categoryExpense, monthlyExpense, userCategoryExpense, userMonthlyExpense, recentUserExpenses, userDailyExpense};
