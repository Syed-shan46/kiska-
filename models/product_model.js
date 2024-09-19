const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    mainImage: { type: String, required: true },
    images: [{
        type: String,
    }],
    mrp: {
        type: Number,
    },
    price: {
        type: Number,
        required: true,
    },

})

const Product = mongoose.model('Product', productSchema);

module.exports = Product;