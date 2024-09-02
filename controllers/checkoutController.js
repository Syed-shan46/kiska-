const CartItem = require('../models/cart_model');
const User = require('../models/user');
const Order = require('../models/order_model');
const uniqid = require('uniqid');
const Address = require('../models/address_model');

const checkoutPage = async (req, res) => {
    const userId = req.session.userId;
    const cartItems = await CartItem.find({ user: userId }).populate('product');
    const userAddress = await User.findById(req.session.userId).populate('addresses');
    // Fetch actual address details using the address IDs
    const addresses = await Address.find({ userAddress });
    console.log('Fetched addresses:', userAddress);
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
        const merchantTransactionId = orderId;
        const user = await User.findById(req.session.userId);


        const { products, totalAmount, addressId, name, house, street, city, state, zipCode, phone } = req.body; // Get the selected address index

        // Check if an address is selected or new address is provided
        let selectedAddress;
        if (addressId) {
            // Use the selected address
            selectedAddress = await Address.findById(addressId);
            if (!selectedAddress) {
                throw new Error("Selected address not found.");
            }
        } else {
            // Create and save a new address
            const newAddress = new Address({
                userId: userId,
                name,
                house,
                street,
                city,
                state,
                zipCode,
                phone
            });
            selectedAddress = await newAddress.save();
            user.addresses.push(selectedAddress);
            await user.save();
        }


        // Create a new order with status "pending"
        const newOrder = new Order({
            userId: userId,
            orderId: orderId,
            merchantTransactionId: merchantTransactionId,
            products: products.map(p => ({
                productId: p.productId,
                quantity: p.quantity
            })), // Transform products to match schema format
            totalAmount,
            orderStatus: 'pending', // Setting order status to pending
            paymentStatus: 'pending', // Setting payment status to pending
            addressId: selectedAddress._id, // Use selected address
            orderDate: new Date(), // Setting order date to the current date
        });


        // Save the new order to the database
        await newOrder.save();


        // Redirect to the payment method selection page after saving the order
        //res.redirect('/cart/checkout/method'); // Replace with your actual route for payment methods
        res.redirect(`/cart/checkout/method?merchantTransactionId=${merchantTransactionId}`);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
};


module.exports = { checkoutPage, PendingOrder }