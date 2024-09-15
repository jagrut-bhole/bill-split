const express = require("express");
const router = express.Router();

const expenseController = require("../controllers/expenseController");
const { requireAuth } = require("../middleware/authmiddleware");

router.get('/expenseDetails', expenseController.expenseDetail_get);

router.post('/edit/:id', expenseController.expenseEdit_post);

router.delete('/deleteExpense/:id',requireAuth,expenseController.expense_delete);

module.exports = router;
