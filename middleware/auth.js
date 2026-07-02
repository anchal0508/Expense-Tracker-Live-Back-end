const jwt = require('jsonwebtoken');
const { User } = require('../models/index');

/**
 * Authentication Middleware Layer (Guard Gate)
 */
const auth = async (req, res, next) => {
    try {
        const token = req.cookies ? req.cookies.token : null;

        if (!token) {

            const error = new Error('Authentication token is missing. Access denied.');
            error.statusCode = 401;
            throw error;

        }

        let verifyUser;

        try {

            verifyUser = jwt.verify(token, process.env.JWT_SECRET);

        } catch (jwtError) {

            const error = new Error('Invalid or expired authentication token');
            error.statusCode = 401;
            throw error;

        }

        const dbUser = await User.findByPk(verifyUser.id, {
            attributes: { exclude: ['password'] }
        });

        if (!dbUser) {
            const error = new Error('User account linked to this token does not exist');
            error.statusCode = 401; 
            throw error;
        }

        // completely sanitized User metadata to request stream object
        req.user = dbUser;
        
        next();

    } catch (error) {
        next(error);
    }
};

module.exports = auth;
