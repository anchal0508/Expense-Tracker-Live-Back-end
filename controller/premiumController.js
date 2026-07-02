const RazorPay = require('razorpay');
const { validatePaymentVerification } = require('razorpay/dist/utils/razorpay-utils');
const { Order } = require('../models/index');

const rzp = new RazorPay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const gold = async (req, res, next) => {
    try {
        const amount = 2500;
        const order = await rzp.orders.create({ amount, currency: "INR" });

        await req.user.createOrder({
            orderid: order.id,
            status: 'PENDING'
        });

        return res.status(201).json({
            success: true,
            order: order,
            key_id: rzp.key_id
        });
    } catch (err) {
        next(err);
    }
}

const update = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            const error = new Error("Missing required compliance tokens.");
            error.statusCode = 400;
            return next(error);
        }

        const isValid = validatePaymentVerification(
            {
                "orderid": razorpay_order_id,
                "paymentid": razorpay_payment_id,
                "signature": razorpay_signature 
            },
            process.env.RAZORPAY_KEY_SECRET 
        );

        if (!isValid) {
            return res.status(400).json({ success: false, message: "Transaction signature mismatch. Fraud detected." });
        }

        const order = await Order.findOne({ where: { orderid: razorpay_order_id } });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order records not found" });
        }

        await order.update({
            paymentid: razorpay_payment_id,
            status: 'SUCCESSFUL'
        });

        return res.status(200).json({
            success: true,
            message: "Transaction Verified and Activated Successfully"
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    gold,
    update
}
