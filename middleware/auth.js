const jwt = require('jsonwebtoken');
const { User } = require('../models/index');

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token invalid or not found..."
            });
        }
        let verifyUser;

        try {

            verifyUser = jwt.verify(token, process.env.JWT_SECRET);

        } catch (jwtError) {

            const error = new Error('Invalid or expired authentication token');
            error.statusCode = 401;
            error.cause = jwtError;
            return next(error);

        }

        
        const dbUser = await User.findByPk(verifyUser.userId, {
            attributes: { exclude: ['password'] }
        });

        if (!dbUser) {
            const error = new Error('User account linked to this token does not exist');
            error.statusCode = 401;
            return next(error);
        }
        req.user = dbUser;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = {auth};