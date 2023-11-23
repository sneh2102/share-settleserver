const router = require('express').Router();
const {createGroup, fetchUserGroups, fetchGroup, groupBalanceSheet,leaveGroup,makeSettlement,groupCategoryExpense} = require("../Controller/groupController");

// routes for group
router.post("/createGroup", createGroup);
router.post("/fetchUserGroups", fetchUserGroups);
router.get("/view/:id", fetchGroup)
router.post("/balancesheet" ,groupBalanceSheet)
router.post("/leave",leaveGroup)
router.post("/settle",makeSettlement)


module.exports = router;