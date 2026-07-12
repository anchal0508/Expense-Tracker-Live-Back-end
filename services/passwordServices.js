// 5
// Shree


const { v4: uuidv4 } = require('uuid');
const { User, forgotPass } = require('../models/index');
const nodemailer = require('nodemailer');


const sendfogotReq = async (userEmail) => {
    const { email } = userEmail;

    const isvalidUser = await User.findOne({
        where: {
            email: email
        }
    });

    if (!isvalidUser) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw (error);
    }
    const requestId = uuidv4();

    await forgotPass.create({
        id: requestId,
        isActive: true,
        expireBy: new Date(Date.now() + 60 * 60 * 1000),
        userId: isvalidUser.id
    });

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${requestId}`;
    console.log(resetLink);

    const mailOption = {
        from: `"ABCROB Nexus: " <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: 'Password reset request',
        html: `
        <p> Click the link below to reset your password</p>
        <a href="${resetLink}"> Reset Password</a>
        `
    };
    await transporter.sendMail(mailOption);


}

const userUpdatePassword = async (passwordData) => {
    const { newPassword, resetPasswordId } = passwordData;

    const checkId = await forgotPass.findOne({
        where: {
            id: resetPasswordId,
            isActive: true
        }
    });

    if (!checkId) {
        return res.status(404).json({
            success: false,
            message: "Invalid or Expired Link"
        });
    }

    const findUser = await User.findOne({
        where: {
            id: checkId.userId
        }
    });

    await findUser.update({
        password: newPassword
    });

    await checkId.update({ isActive: false });
    return;
}

const verifyPassword = async (reqid) => {
    const { id } = reqid;

    const validateId = await forgotPass.findByPk(id);

    if (!validateId) {
        return res.status(404).json({
            success: false,
            message: 'Link Expired or Invalid'
        });
    }

}

module.exports = {
    sendfogotReq,
    userUpdatePassword,
    verifyPassword
}