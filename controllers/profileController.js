const User = require('../models/user');
const Products = require('../models/product_model');
const mongoose = require('mongoose');
const { Address } = require('../models/address_model');
const Order = require('../models/order_model');


const postAddress = async (req, res) => {
    console.log('req body', req.body);
    console.log('req body', req.params);
    try {
        if (req.session && req.session.userId) {
            const { name, house, street, city, state, zipCode, phone } = req.body;
            const address1 = new Address({
                name,
                house,
                street,
                city,
                state,
                zipCode,
                phone,
            })

            const savedAddress = await address1.save();


            const user = await User.findById(req.session.userId);
            if (!user) {
                return res.status(404).json({ message: ' User not found' });
            }

            user.addresses.push(savedAddress._id);
            await user.save();
            res.redirect('/cart/checkout')
        } else {
            return res.status(400).json({ message: 'No logged user found' })
        }
    } catch (error) {
        return res.status(400).json({ message: 'something went wrong' });
    }
}

const getAddress = async (req, res) => {
    try {
        const userId = req.session.userId;
        if (req.session && req.session.userId) {
            const userData = await User.findById(req.session.userId).populate('addresses');
            const orders = await Order.find({ userId }).populate('products.productId');
            res.render('user/profile', { userData, isLoggedIn: !!req.session.userId, orders });
        } else {
            res.redirect('/register');
        }
    } catch (error) {
        console.error('Error in getProfile:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

module.exports = { postAddress, getAddress };
