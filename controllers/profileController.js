const User = require('../models/user');
const Products = require('../models/product_model');
const mongoose = require('mongoose');
const Address = require('../models/address_model');
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
        return res.status(400).json({ message: 'something went wrong', error: error.message });

    }
}

/// get addresses and orders
const getAddress = async (req, res) => {
    try {
        const userId = req.session.userId;
        // Fetch the user's details from the database
        const user = await User.findById(userId);
        // Gets the total number of orders
        const totalOrders = await Order.countDocuments({ userId: userId });

        if (req.session && req.session.userId) {
            const userData = await User.findById(req.session.userId).populate('addresses');
            const orders = await Order.find({ userId: userId, paymentStatus: 'Paid' })
                .populate('products.productId')
                .sort({ orderDate: -1 })
                .populate('addressId')
                .exec();
            res.render('user/profile', { userData, isLoggedIn: !!req.session.userId, orders, user, totalOrders });
        } else {
            res.redirect('/register');
        }
    } catch (error) {
        console.error('Error in getProfile:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

const getProfile = async (req, res) => {
    // Assuming you have user ID stored in session
    const userId = req.session.userId;
    // Fetch the user's details from the database
    const user = await User.findById(userId);
    res.render('user/update-profile', { user });

}

const updateUserProfile = async (req, res) => {
    const { firstName, lastName, phone } = req.body;
    const userId = req.session.userId; // Assuming you have user ID stored in session

    // Array to collect error messages
    const errors = {};
    if (!phone) {
        errors.phone = 'Phone number is required.';
    } else if (!/^\d{10}$/.test(phone)) {
        errors.phone = 'Phone number must be exactly 10 digits.';
    }

    // Check for validation errors
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ success: false, errors });
    }


    // Check for validation errors
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ success: false, errors });
    }
    try {
        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.json({ success: false, error: 'User not found.' });
        }

        // Update user details
        user.firstName = firstName;
        user.lastName = lastName;
        user.phone = phone;

        // Save the updated user information
        await user.save();

        // Update the session with new user information
        req.session.user = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        };

        // Respond with success
        res.redirect('/profile')
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ success: false, error: 'Error updating user profile.' });
    }
};

const viewAllAddress = async (req, res) => {
    try {
        const userId = req.session.userId;
        if (req.session && req.session.userId) {
            const userAddress = await User.findById(req.session.userId).populate('addresses');
            res.render('user/view-all-address', {userAddress }); // 'updateAddressForm' is your Handlebars template file
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Internal Server Error');
    }
}
const getUpdateAddress = async (req, res) => {
    try {
        const userId = req.session.userId;
        if (req.session && req.session.userId) {
            const userData = await User.findById(req.session.userId).populate('addresses');
            res.render('user/update-address', { userData }); // 'updateAddressForm' is your Handlebars template file
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Internal Server Error');
    }
}


module.exports = {
    postAddress,
    getAddress,
    updateUserProfile,
    getProfile,
    getUpdateAddress,
    viewAllAddress,
};
