const { createUser, userLogin } = require('../services/userService');
const jwt = require('jsonwebtoken');

const addUser = async (req, res, next) => {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
        return res.status(400).json({
            success: false,
            message: "All Fields are required"
        });
    }

    try {
        const response = await createUser({ name, email, phone, password });

        

        return res.status(201).json({
            success: true,
            message: "User has been added Successfully...",
            data: response
        });


    } catch (error) {
        next(error);
    }
}

const login = async (req, res, next) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All Fields are required"
            });
        }

        const response = await userLogin({ email, password });

        const token = jwt.sign(
            { userId: response.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE_IN }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            message: "User LoggedIn Successfully",
            data: response
        });

    } catch (error) {
        next(error);
    }
}

const profile = async (req, res, next) => {
    try {
        if (req.user) {
            return res.status(200).json({
                success: true,
                message: "verified Successfully...!",
                data: req.user
            });
        }

        else {
            const error = new Error('User not loggedIn or verified');
            error.statusCode = 403;
            return next(error);
        }
    }
    catch (error) {
        next(error);
    }

}

const logout = async (req, res, next) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        });

        return res.status(200).json({
            success: true,
            message: "successfully LoggedOut"
        })
    } catch (error) {
        next(error);
    }
}
module.exports = {
    addUser,
    login,
    profile,
    logout
}