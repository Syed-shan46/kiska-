const CartItem = require('../models/cart_model');
const mongoose = require('mongoose');
const Product = require('../models/product_model');

const viewSingleItem = async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.session.userId;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send('Invalid product Id');
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send('Product Not found');
        }

        res.render('user/product', {
            product,
            userId,
            productId,
            isLoggedIn: !!userId,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving product details');
    }
}

module.exports = { viewSingleItem }
