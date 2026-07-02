require('dotenv').config();

const cookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models/index');


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(cors({
    origin: 'https://exp-anchal555.netlify.app', // 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));



const userRouter = require('./router/userRouter');
const expenseRouter = require('./router/expenseRouter');


app.use('/api/users/', userRouter);
app.use('/api/expenses/', expenseRouter);


// Global Error handling
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server Error";

    console.log("Global Error Logged: ", err.stack)

    res.status(statusCode).json({
        success: false,
        message: message,
        status: statusCode,

        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});



const PORT = process.env.PORT || 3000;

// Force Sync setup jo tables banayega
db.sequelize.authenticate()
    .then(() => {
        console.log("Database connected successfully to Supabase! 🚀");
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running successfully on port ${PORT}...`);
        });
    })
    .catch((err) => {
        // err.message की जगह पूरा err प्रिंट करें ताकि असली वजह दिखे
        console.error('CRITICAL: DB Connection failed...', err.stack); 
    });
