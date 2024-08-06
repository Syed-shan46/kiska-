const CartItem = require('../models/cart_model');
const User = require('../models/user');

const checkoutPage = async (req, res) => {
    const userId = req.session.userId;
    const cartItems = await CartItem.find({ user: userId }).populate('product');
    const userAddress = await User.findById(req.session.userId).populate('addresses');
    let totalAmount = 0;
    cartItems.forEach(item => {
        totalAmount += item.product.price * item.quantity
    })
    res.render('user/checkout', {
        userAddress,
        userId,
        cartItems,
        totalAmount,
        isLoggedIn: !!req.session.userId
    });
}

module.exports = {checkoutPage}