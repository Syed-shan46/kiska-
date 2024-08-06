const CartItem = require('../models/cart_model');

const fetchCartData = async (req, res, next) => {
    try {
        if (req.session.userId) {
            const userId = req.session.userId;
            const cartItems = await CartItem.find({ user: userId }).populate('product');
            res.locals.cartItems = cartItems;
        } else {
            res.locals.cartItems = [];
        }
    } catch (error) {
        console.error(error);
        res.locals.cartItems = [];
    }
    next();
}

const getCartCount = async (req, res, next) => {
    if (req.session.userId) {
        try {
            const cartCount = await CartItem.countDocuments({ user: req.session.userId });
            res.locals.cartCount = cartCount;
        } catch (error) {
            console.error(error);
            res.locals.cartCount = 0;
        }
    } else {
        res.locals.cartCount = 0;
    }
    next();
};



module.exports = { fetchCartData, getCartCount };