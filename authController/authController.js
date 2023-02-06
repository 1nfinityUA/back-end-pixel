const User = require('../models/User.js');
const Token = require('../models/Token.js')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios')
require('dotenv').config();


class authCotroller {
    // user registration with filter id (phone number or email) it's very simple filter
    async singup(req, res) {
        try {
            const {id, password} = req.body
            const candidate = await User.findOne({id})
            if (candidate) {
                return res.status(400).json({message: 'User with this phone or email allready exist'})
            }
            if (/[a-z]/i.test(req.body.id) && req.body.id.includes('@')) {
                const hashPassword = bcrypt.hashSync(password, 5)
                const user = new User({id, password: hashPassword, id_type: "email"})
                await user.save();
                const token = jwt.sign(
                    {
                        _id: user._id,
                    },
                    process.env.JWT_ACCESS_T,
                    {
                        expiresIn: '10m'
                    }
                )
                const tokenData = new Token({user, token})
                await tokenData.save();
                return res.status(200).json({message: 'User created', token})
            }
            if(/^(\s*)?(\+)?([- _():=+]?\d[- _():=+]?){10,14}(\s*)?$/.test(req.body.id)) {
                const hashPassword = bcrypt.hashSync(password, 5)
                const user = new User({id, password: hashPassword, id_type: "phone"})
                await user.save();
                const token = jwt.sign(
                    {
                        _id: user._id,
                    },
                    process.env.JWT_ACCESS_T,
                    {
                        expiresIn: '10m'
                    }
                )
                const tokenData = new Token({user, token})
                await tokenData.save();
                return res.status(200).json(token)
            }
            return res.status(400).json({message: 'invalid phone or email'})
        }
        catch (err) {
            console.log(err)
            res.status(400).json({message: 'Sing up error'})
        }
    }
    // user login 
    async singin(req, res) {
        try {
            const {id, password} = req.body;
            const user = await User.findOne({id})
            if (!user) {
                return res.json({message: 'User not found'})
            }
            const token = await Token.findOne({user: user._id})
            const validPassword = bcrypt.compareSync(password, user.password)
            if (id === user.id && validPassword) {
                return res.status(200).json(token.token)
            }
            return res.json({message: 'wrong id or password'})
        }
        catch (err) {
            console.log(err)
            res.status(400).json({message: 'Sing in error'})
        }
    }
    // get user info by token and update it
    async info(req, res) {
        try {
            const tokenReq = req.headers.authorization.split(" ")[1];
            const decodedData = jwt.verify(tokenReq, process.env.JWT_ACCESS_T);
            const user = await User.findOne({_id: decodedData._id});
            const token = jwt.sign(
                {
                    _id: user._id,
                },
                process.env.JWT_ACCESS_T,
                {
                    expiresIn: '10m'
                }
            );
            await Token.updateOne(
                {
                    user: decodedData._id
                },
                {
                    token: token
                }
            );
            return res.status(200).json({
                id: user.id,
                id_type: user.id_type
            })
        }
        catch (err) {
            console.log(err)
            res.status(400).json({message: 'Get info error'})
        }
    }
    // update tokin and findout latency for google.com
    async latency(req, res) {
        try {
            const tokenReq = req.headers.authorization.split(" ")[1];
            const decodedData = jwt.verify(tokenReq, process.env.JWT_ACCESS_T);
            const user = await User.findOne({_id: decodedData._id});
            const token = jwt.sign(
                {
                    _id: user._id,
                },
                process.env.JWT_ACCESS_T,
                {
                    expiresIn: '10m'
                }
            );
            await Token.updateOne(
                {
                    user: decodedData._id
                },
                {
                    token: token
                }
            );
            const start= new Date().getTime();
            const response  = await axios.get('https://www.google.com/');
            const end = new Date().getTime();
            return res.status(200).json({
                message: `latency time for google.com: ${end - start}ms`
            })
            }
        catch (err) {
            console.log(err)
            res.status(400).json({message: 'Get latency error'})
        }
    }
    // delete tokens from DB
    async logout(req, res) {
        try {
            const tokenReq = req.headers.authorization.split(" ")[1];
            const decodedData = jwt.verify(tokenReq, process.env.JWT_ACCESS_T);
            if (req.body.all) {
                await Token.remove({})
                return res.status(200).json({
                    message: 'all tokens remowed'
                });
            }
            await Token.remove({user: decodedData._id})
            return res.status(200).json({message: 'user token removed'})
        }
        catch (err) {
            console.log(err)
            res.status(400).json({message: 'Get logout error'})
        }
    }
}

module.exports = new authCotroller()