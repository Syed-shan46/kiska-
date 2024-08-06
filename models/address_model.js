const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    name: { type: String },
    house: { type: String },
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    phone: { type: Number },
});
const Address = mongoose.model('Address', AddressSchema);
module.exports = { Address };