const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    addresses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
    }],
    firstName: {
        type: String, required: true
    },
    lastName: {
        type: String,
    },
    city: {
        type: String,
    },
    phone: {
        type: Number, required: true,
    },
    email: {
        type: String, required: true,
    },
    password: {
        type: String, required: true,
    },
    confirmPw: {
        type: String,
    }

}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;