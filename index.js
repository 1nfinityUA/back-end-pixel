require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const authRouter = require('./authRoutes/authRoutes.js');
const cors = require('cors');

const app = express()
app.use(express.json());
app.use(cors({
    origin: '*'
}));
app.use('/auth', authRouter);


const start = async () => {
    try {
        await mongoose.connect(process.env.DB)
        app.listen(process.env.PORT, () => console.log(`server run on ${process.env.PORT} port`));
    } catch (err) {
        console.log(err);
    }
};
start()