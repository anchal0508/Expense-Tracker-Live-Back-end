// 5
// Shree

const { sendfogotReq, userUpdatePassword, verifyPassword } = require('../services/passwordServices');

const forgotReq = async (req, res, next) => {
    try {

        const { email } = req.body;

        if (!email) {
            const error = new Error("Email is required");
            error.statusCode = 400;
            return next(error);
        }

        const isvalidUser = await sendfogotReq({ email });

        return res.status(200).json({
            success: true,
            message: "Password Reset Link has been sent Successfully...!"
        });

    } catch (error) {
        next(error);
    }
}

const passwordverification = async (req, res, next) => {
    try {
        const { id } = req.params;

        await verifyPassword({ id });


        return res.status(200).json({
            success: true,
            message: "Link has been verified Successfully...!"
        })

    } catch (error) {
        next(error);
    }
}

const updatePassword = async (req, res) => {
    const { newPassword } = req.body;
    const { resetPasswordId } = req.params;

    try {
        if (!resetPasswordId) {
            return res.status(404).json({
                success: false,
                message: 'Invalid Link'
            });
        }


        if (!newPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password is required'
            });
        }

        await userUpdatePassword({ newPassword, resetPasswordId });


        return res.status(200).json({
            success: true,
            message: "Password Has been Updated Successfully...!"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error: Update Password: " + error.message
        });
    }
}

module.exports = {
    forgotReq,
    passwordverification,
    updatePassword

}