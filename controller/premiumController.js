const RazorPay = require('razorpay');
const { Order } = require('../models/index');
const crypto = require('crypto');

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

        // const isValid = validatePaymentVerification(
        //     {
        //         "orderid": razorpay_order_id,
        //         "paymentid": razorpay_payment_id,
        //         "signature": razorpay_signature 
        //     },
        //     process.env.RAZORPAY_KEY_SECRET 
        // );

// ----------------------- replacing -----------------------
const secret = process.env.RAZORPAY_KEY_SECRET;

const generated_signature = crypto
            .createHmac('sha256', secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

// ----------------------- replacing -----------------------


const isValid = generated_signature === razorpay_signature;

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


    
    const getTransactionHistory = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit, 10);
        const parsedLimit = isNaN(limit) || limit <= 0 ? 5 : limit;
        
        const { lastId, lastCreatedAt } = req.query;

        const searchQuery = {
            userId: req.user.id
        };

        if (lastId && lastCreatedAt) {
            searchQuery[Op.or] = [
                {
                    createdAt: {
                        [Op.lt]: new Date(lastCreatedAt) 
                    }
                },
                {
                    createdAt: new Date(lastCreatedAt),
                    id: {
                        [Op.lt]: lastId 
                    }
                }
            ];
        }

        const rows = await Order.findAll({
            where: searchQuery,
            limit: parsedLimit + 1, 
            order: [
                ['createdAt', 'DESC'],
                ['id', 'DESC']
            ],
            attributes: ['id', 'orderid', 'paymentid', 'status', 'createdAt']
        });

        const hasNextPage = rows.length > parsedLimit;
        if (hasNextPage) {
            rows.pop(); 
        }

        const nextCursor = hasNextPage ? {
            lastId: rows[rows.length - 1].id,
            lastCreatedAt: rows[rows.length - 1].createdAt
        } : null;

        return res.status(200).json({
            success: true,
            orders: rows,
            pagination: {
                hasNextPage: hasNextPage,
                nextCursor: nextCursor 
            }
        });
    } catch (err) {
        next(err);
    }
};
module.exports = {
    gold,
    update,
    getTransactionHistory
}
