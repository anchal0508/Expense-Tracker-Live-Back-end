const { createUser, userLogin } = require('../services/userService');
const jwt = require('jsonwebtoken');
const {Order} = require('../models/index');

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
            { id: response.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE_IN }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000,
            partitioned: true
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
            let isPaidMember = "No";

            try {
                const successfulOrder = await Order.findOne({
                    where: {
                        userId: req.user.id,
                        status: 'SUCCESSFUL'
                    }
                });
                if (successfulOrder) {

                    isPaidMember = "Yes";
                } else {
                    isPaidMember: "No";
                }
            } catch (dbErr) {
                console.error("Orders table lookup bypassed or missing----:", dbErr.message);
                isPaidMember = "No";
            }

            return res.status(200).json({
                success: true,
                message: "verified Successfully...!",
                data: {
                    id: req.user?.id,
                    name: req.user?.name,
                    email: req.user?.email,
                    role: req.user?.role ?? 'student',
                    phone: req.user?.phone,
                    dob: req.user?.dob ?? null,
                    profilePhoto: req.user?.profilePhoto ?? '',
                    address: req.user?.address ?? null,
                    isPremium: isPaidMember,

                }
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
};

const logout = async (req, res, next) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            partitioned: true,
            path: '/'
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