// 5
// Shree



const { User } = require('../models/index');
const bcrypt = require('bcryptjs');

const createUser = async (userData) => {
    const { email } = userData;

    const existingUser = await User.findOne({
        where: {
            email: email
        }
    });

    if (existingUser) {
        const error = new Error('User Already exists');
        error.statucCode = 400;
        throw error;
    }

    const response = await User.create({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password
    });
    return response;
}



const userLogin = async (userData) => {

    const { email, password } = userData;

    const existingUser = await User.findOne({
        where: {
            email: email
        }
    });

    if (!existingUser) {
        const error = new Error('User does not exists...');
        error.status = 400;
        throw error;
    }

    const isMatched = await bcrypt.compare(password, existingUser.password);
    if (isMatched) {
        return existingUser;
    }
    else {
        const error = new Error('Email id or Password is wrong.. Please try again');
        error.statusCode = 401;
        throw error;
    }
}
module.exports = {
    createUser,
    userLogin,
}