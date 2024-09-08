const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    ip: { type: String, unique: true },  // Store IP address
    date: { type: Date, default: Date.now }  // Timestamp of visit
});

const Visitor = mongoose.model('Visitor', visitorSchema);

module.exports = Visitor;
