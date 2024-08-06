const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    addresses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address', 
    }],
    email: {
        type: String, required: true,
    },
    password: {
        type: String, required: true,
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;