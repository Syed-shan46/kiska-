const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    ip: {
        type: String,
        required: true,
        unique: true
    },
    visitCount: {
        type: Number,
        default: 1
    }
});

const Visitor = mongoose.model('Visitor', visitorSchema);

module.exports = Visitor;
