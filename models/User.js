const { Schema, model } = require('mongoose');

const User = new Schema({
    id: {
        type: String,
        unique: true,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    id_type: {
        type: String,
    }
})
module.exports = model('User', User)