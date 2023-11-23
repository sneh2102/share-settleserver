const express = require('express');
const { addExpense, deleteExpense, viewGroupExpense, viewUserExpense, viewExpense, viewUserGroupExpense, categoryExpense, monthlyExpense, userCategoryExpense, userDailyExpense, userMonthlyExpense, recentUserExpenses} = require('../Controller/expenseController')

const router = express.Router();


router.post("/add", addExpense)
router.post("/delete", deleteExpense)
router.post("/groupexpense", viewGroupExpense)
router.post("/userexpense", viewUserExpense)
router.post("/view", viewExpense)
router.post("/view/usergroupexpense", viewUserGroupExpense)
router.post("/groupcategory", categoryExpense)
router.post("/monthlyexpense",monthlyExpense)
router.post("/usercategory",userCategoryExpense)
router.post("/monthly/expense",userMonthlyExpense)
router.post("/recent/expense",recentUserExpenses)
router.post("/daily-expense",userDailyExpense)

module.exports = router;