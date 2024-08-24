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

        // Extract data from the request body
        const { products, totalAmount, addressRadio } = req.body;

        // Assuming `userAddress` object is available in the session or fetched from DB
        const userAddress = req.session.userAddress || await User.findById(userId).select('addresses').exec();

        // Extract the selected address using the address index (addressRadio)
        //const selectedAddressIndex = parseInt(addressRadio); // Ensure it's a number
        const selectedAddress = userAddress.addresses[0]; // Get the correct address

        if (!selectedAddress) {
            throw new Error("Selected address is invalid or not found.");
        }


        // Create a new order with status "pending"
        const newOrder = new Order({
            userId: userId,
            orderId: orderId,
            products: products.map(p => ({
                productId: p.productId,
                quantity: p.quantity
            })), // Transform products to match schema format
            totalAmount,
            orderStatus: 'pending', // Setting order status to pending
            paymentStatus: 'pending', // Setting payment status to pending
            address: [selectedAddress], // Use selected address
            orderDate: new Date(), // Setting order date to the current date
        });

        // Save the new order to the database
        await newOrder.save();


        // Redirect to the payment method selection page after saving the order
        res.redirect('/cart/checkout/method'); // Replace with your actual route for payment methods
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
};


module.exports = { checkoutPage, PendingOrder }