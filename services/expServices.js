const { Op } = require('sequelize');
const { Expense } = require('../models/index');


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

    const { page = 1, limit = 5, cursor } = filters;

    const whereClause = { userId: userId };
    const offset = (page - 1) * limit;
    if (cursor) {
        whereClause.id = {
            [Op.lt]: parseInt(cursor, 10)
        };
    }

    const groupedData = await Expense.findAndCountAll({
        where: whereClause,
        order: [
            ['date', 'DESC'],
            ['id', 'DESC']
        ],
        limit: limit,
        raw: true,
        offset: offset
    });
    const totalPages = (groupedData.count / limit) || 1;
    // console.log("----------->>>------------",groupedData.count, limit);



    return {
        expenses: groupedData.rows,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
        currentPage: page,
        totalPages: totalPages,
    };
}


module.exports = {
    addExpInDb,
    getAllExpByUser,

}