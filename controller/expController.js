const { addExpInDb, getAllExpByUser } = require('../services/expServices');

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
        const { page, limit, cursor } = req.query; 
        
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 5;
        
        const cursorNum = (cursor && cursor !== 'null' && cursor !== 'undefined') ? parseInt(cursor, 10) : null;
        
        const response = await getAllExpByUser(req.user.id, {
            page: pageNum,
            limit: limitNum,
            cursor: cursorNum
        });
        
        return res.status(200).json({
            success: true,
            expenses: response.expenses,
            currentPage: response.currentPage,
            hasNext: response.hasNext,
            hasPrevious: response.hasPrevious,
            totalPages: response.totalPages,
            nextCursor: response.nextCursor 
        });

    } catch (error) {
        next(error);
    }
}

module.exports = {
    addExp,
    allExp,
}
