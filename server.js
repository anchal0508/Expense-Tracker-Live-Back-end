require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const db = require('./models/index');



app.use(cors({
    origin: 'https://exp-anchal555.netlify.app/',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const userRouter = require('./router/userRouter');
const expenseRouter = require('./router/expenseRouter');


app.use('/api/users/', userRouter);
app.use('/api/expenses/', expenseRouter);





app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message;
    console.log(err.stack);
    res.status(statusCode).json({
        success: true,
        message: message,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", async () => {
    console.log(`......I'm Online on port ${PORT}.....!!!`);
    
    // Database connection check karein
    try {
        await db.sequelize.authenticate();
        console.log('Database connected successfully.');
    } catch (err) {
        console.error('DATABASE CONNECTION FAILED:', err.message);
        console.error(err.stack);
    }
});