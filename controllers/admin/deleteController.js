const express = require('express');
const router = express.Router();
const Product = require('../../models/product_model');

const deleteController = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.query.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.redirect('/admin')
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error })
    }
}

module.exports = { deleteController }