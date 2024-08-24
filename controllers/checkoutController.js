const CartItem = require('../models/cart_model');
const User = require('../models/user');
const Order = require('../models/order_model');
const uniqid = require('uniqid');

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

const PendingOrder = async (req, res) => {
    try {
        const userId = req.session.userId;
        const orderId = uniqid();
        const { products, totalAmount, addressRadio } = req.body;
        const userAddress = req.session.userAddress || await User.findById(userId).select('addresses').exec();
        const selectedAddress = userAddress.addresses[0]; // Simplified for example

        if (!selectedAddress) {
            throw new Error("Selected address is invalid or not found.");
        }

        const newOrder = new Order({
            userId: userId,
            orderId: orderId,
            products: products.map(p => ({
                productId: p.productId,
                quantity: p.quantity
            })),
            totalAmount,
            orderStatus: 'pending',
            paymentStatus: 'pending',
            address: [selectedAddress],
            orderDate: new Date(),
            merchantTransactionId: orderId, // Use orderId as merchantTransactionId initially
        });

        await newOrder.save();
        res.redirect('/pay?transactionId=' + orderId); // Redirect with the merchantTransactionId
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
};


module.exports = { checkoutPage, PendingOrder }