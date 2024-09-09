const mongoose = require('mongoose');

const visitCounterSchema = new mongoose.Schema({
    count: {
        type: Number,
        default: 0,
    },
});

const VisitCounter = mongoose.model('VisitCounter', visitCounterSchema);

module.exports = VisitCounter;
