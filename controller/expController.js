// 5
// Shree



const { addExpInDb, getAllExpByUser, deleteExpense, updateExpenseInDb } = require('../services/expServices');

const updateExp = async (req, res, next) => {
    try {
        const { id } = req.params; // Target transaction id
        const { expenseOn, description, amount, date, income } = req.body;

        if (!expenseOn || amount === undefined || !date) {
            const error = new Error('Expense name, amount and Date are required fields.');
            error.statusCode = 400;
            throw error;
        }

        // Service to execute database engine operations
        const response = await updateExpenseInDb(id, req.user.id, {
            expenseOn,
            description: description || '---',
            amount: Number(amount),
            date,
            income: Number(income)
        });

        return res.status(200).json({
            success: true,
            message: "Expense updated Successfully...!",
            data: response
        });

    } catch (error) {
        next(error);
    }
};


const downloadCSV = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const { Op } = require('sequelize');
        const { Expense } = require('../models/index');
        
        const whereClause = { userId: req.user.id };

        if (startDate && endDate) {
            whereClause.date = {
                [Op.between]: [startDate, endDate]
            };
        }

        const expenses = await Expense.findAll({
            where: whereClause,
            order: [['date', 'DESC']],
            raw: true
        });

        // CSV Structure content builder string setup
        let csvContent = "S.No.,Date,Expense,Description,Income,Amount,Total Balance\n";

        expenses.forEach((item, index) => {
            const rowDate = item.date ? new Date(item.date).toLocaleDateString() : 'N/A';
            const expenseOn = item.expenseOn ? item.expenseOn.replace(/,/g, " ") : ""; 
            const description = item.description ? item.description.replace(/,/g, " ") : "";
            const income = item.income || 0;
            const amount = item.amount || 0;
            const totalAmount = item.totalAmount || 0;

            csvContent += `${index + 1},${rowDate},${expenseOn},${description},${income},${amount},${totalAmount}\n`;
        });

        // Web Client Headers validation instructing file download processing loop 📥
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=Expenses_Report.csv');
        
        return res.status(200).send(csvContent);

    } catch (error) {
        next(error);
    }
};


const addExp = async (req, res, next) => {
    const { expenseOn, description, amount, date, income } = req.body;


    try {
        if (!expenseOn || !amount || !date) {
            const error = new Error('Expense name, amound and Date is required... ');
            error.statusCode = 400;
            throw error;
        }

        const response = await addExpInDb({
            userId: req.user.id,
            expenseOn: expenseOn,
            description: description || '---',
            amount: amount,
            date: date || new Date(),
            income: income || 0
        });

        return res.status(201).json({
            success: true,
            message: 'Expense added Successfully...!',
            data: response
        });

    } catch (error) {
        next(error);
    }
}

const allExp = async (req, res, next) => {
    try {
        const { page=1, limit=5, search= '', cursor, groupData } = req.query;

        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 5;

        const cursorNum = (cursor && cursor !== 'null' && cursor !== 'undefined') ? parseInt(cursor, 10) : null;

        const response = await getAllExpByUser(req.user.id, {
            page: pageNum,
            limit: limitNum,
            cursor: cursorNum,
            groupData: groupData,
            search: search
        });

        return res.status(200).json({
            success: true,
            expenses: response.expenses,
            currentPage: response.currentPage,
            hasNext: response.hasNext,
            hasPrevious: response.hasPrevious,
            totalPages: response.totalPages,
            nextCursor: response.nextCursor,
            isGrouped: response.isGrouped
        });

    } catch (error) {
        next(error);
    }
}

const deleteExp = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log("Deleting Expense with ID:-------------->>>-------------", id);
        const response = await deleteExpense({ id });

        return res.status(200).json({
            success: true,
            message: "Expense deleted Successfully...!",
            data: response
        });

    } catch (error) {
        next(error);
    }
}
module.exports = {
    addExp,
    allExp,
    deleteExp,
    downloadCSV,
    updateExp
}
