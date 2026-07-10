const { Op, where } = require('sequelize');
const { Expense , sequelize} = require('../models/index');

const updateExpenseInDb = async (id, userId, updatedData) => {
    try {
        const expenseRecord = await Expense.findOne({
            where: { id: id, userId: userId }
        });

        if (!expenseRecord) {
            const error = new Error('Expense record not found or unauthorized access.');
            error.statusCode = 404;
            throw error;
        }

        const previousTotalAmount = Number(expenseRecord.totalAmount) - Number(expenseRecord.income) + Number(expenseRecord.amount);
        const newTotalAmount = previousTotalAmount + Number(updatedData.income) - Number(updatedData.amount);

        await Expense.update({
            expenseOn: updatedData.expenseOn,
            description: updatedData.description,
            amount: updatedData.amount,
            date: updatedData.date,
            income: updatedData.income,
            totalAmount: newTotalAmount 
        }, {
            where: { id: id }
        });

        return { id, ...updatedData, totalAmount: newTotalAmount };

    } catch (dbError) {
        console.error('Sequelize update postgres engine exception logic failed:', dbError.message || dbError);
        throw dbError;
    }
};

const addExpInDb = async (expData) => {
    try {
        const lastTransaction = await Expense.findOne({
            where: { userId: expData.userId },
            order: [['createdAt', 'DESC']]
        });

        const previousBalance = lastTransaction ? Number(lastTransaction.totalAmount) : 0;
        const newTotalAmount = previousBalance + Number(expData.income) - Number(expData.amount);

        const response = await Expense.create({
            userId: expData.userId,
            user_id: expData.userId,
            expenseOn: expData.expenseOn,
            description: expData.description,
            amount: expData.amount,
            date: expData.date,
            income: expData.income,
            totalAmount: newTotalAmount
        });
        return response;
    } catch (dbError) {
        console.error('Native postgres Engine error:', dbError.message || dbError);
        throw dbError;
    }
}


const getAllExpByUser = async (userId, filters) => {
    const { page = 1, limit = 5, groupData = 'all' , search='', cursor} = filters;
    const offset = (page - 1) * limit;
    
    const whereClause = { userId: userId };

    if (search && search.trim() !== '') {
        whereClause[Op.or] = [
            {
                expenseOn: {
                    [Op.iLike]: `%${search}%` 
                }
            },
            {
                description: {
                    [Op.iLike]: `%${search}%` 
                }
            }
        ];
    }

    if (!groupData || groupData === 'all') {
        
        if (cursor && cursor !== 'null' && cursor !== 'undefined') {
            whereClause.id = {
                [Op.gt]: parseInt(cursor, 10) 
            };
        }

        const groupedData = await Expense.findAndCountAll({
            where: whereClause,
            order: [
                ['date', 'DESC'],
                ['id', 'DESC']
            ],
            limit: parseInt(limit, 10),
            offset: offset,
            raw: true
        });
        
        const totalPages = Math.ceil(groupedData.count / limit) || 1;

        return {
            expenses: groupedData.rows,
            hasNext: page < totalPages,
            hasPrevious: page > 1,
            currentPage: parseInt(page, 10),
            totalPages: totalPages,
            isGrouped: false
        };
    }

    let dateTruncValue = 'day';  
    if (groupData === 'monthly') dateTruncValue = 'month';
    if (groupData === 'yearly') dateTruncValue = 'year';

    const countQuery = await Expense.findAll({
        where: whereClause,
        attributes: [
            [sequelize.fn('DATE_TRUNC', dateTruncValue, sequelize.col('date')), 'period']
        ],
        group: [sequelize.fn('DATE_TRUNC', dateTruncValue, sequelize.col('date'))],
        raw: true
    });
    const totalRecords = countQuery.length;
    const totalPages = Math.ceil(totalRecords / limit) || 1;

    const groupedRows = await Expense.findAll({
        where: whereClause,
        attributes: [
            [sequelize.fn('DATE_TRUNC', dateTruncValue, sequelize.col('date')), 'date'],
            [sequelize.fn('SUM', sequelize.cast(sequelize.col('amount'), 'numeric')), 'amount'],
            [sequelize.fn('SUM', sequelize.cast(sequelize.col('income'), 'numeric')), 'income'],
            [sequelize.literal(`'Grouped summary'`), 'expenseOn'],
            [sequelize.literal(`'Total for the ${dateTruncValue}'`), 'description']
        ],
        group: [sequelize.fn('DATE_TRUNC', dateTruncValue, sequelize.col('date'))],
        order: [[sequelize.fn('DATE_TRUNC', dateTruncValue, sequelize.col('date')), 'DESC']],
        limit: parseInt(limit, 10),
        offset: offset,
        raw: true
    });

    
    return {
        expenses: groupedRows,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
        currentPage: parseInt(page, 10),
        totalPages: totalPages,
        isGrouped: true
    };
};

const deleteExpense = async(deleteId) =>{
    const {id} = deleteId;

    const response = await Expense.destroy({
        where: {
            id: id
        }
    });

    return response;
}

module.exports = {
    addExpInDb,
    getAllExpByUser,
    deleteExpense,
    updateExpenseInDb

}