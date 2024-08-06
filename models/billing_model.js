const mongoose = require('mongoose')
const Schema = mongoose.Schema

const billingSchema = new mongoose.Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    country: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: Number, required: true },
    phone: { type: Number, required: true },
    email: { type: String, required: true },
})

const Billing = mongoose.model('Billing', billingSchema);

module.exports = Billing