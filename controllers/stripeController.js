const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mongoose = require('mongoose');
const Cart = require('../models/cart_model'); // Ensure this is the correct path
const Order = require('../models/order_model'); // Ensure this is the correct path
const User = require('../models/user'); // Ensure this is the correct path
const { v4: uuidv4 } = require('uuid');


const getCardPayment = async (req, res) => {
    try {
        if (req.session && req.session.userId) {

            const userId = req.session.userId;

            // Log userId to verify it's correct
            console.log('User ID:', userId);

            // Fetch user data and populate addresses
            const userData = await User.findById(userId).populate('addresses');
            const selectedAddress = userData.addresses[0];
            console.log('User Data:', userData);

            // Fetch and populate cart
            const cartItems = await Cart.find({ user: userId }).populate('product');
            let totalAmount = 0;
            cartItems.forEach(item => {
                totalAmount += item.product.price * item.quantity
            })
            // Log cart data to verify it's being fetched
            console.log('Cart Data:', cartItems);


            const orderId = uuidv4();

            // Create Order object with all required fields
            const order = new Order({
                userId,
                orderId: orderId,
                products: cartItems.map(item => ({
                    productId: item.product._id,
                    quantity: item.quantity,
                })),
                totalAmount: totalAmount,
                orderStatus: 'Pending',
                paymentStatus: "Processing",
                address: selectedAddress, // Ensure this is a valid address object
                orderDate: new Date() // Set the current date or a specific date
            });

            // Save Order to the database
            await order.save();
            req.session.orderId = order._id;

            // Prepare line items for Stripe Checkout
            const line_items = cartItems.map((item) => ({
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: item.product.name // Ensure this matches your Product schema
                    },
                    unit_amount: item.product.price * 100 // Convert dollars to cents
                },
                quantity: item.quantity
            }));

            // Create Stripe Checkout Session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: line_items,
                mode: 'payment',
                success_url: `${process.env.BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
                cancel_url: `${process.env.BASE_URL}/cancel`,
                metadata: {
                    orderId: orderId,
                }
            });

            res.redirect(303, session.url);

        } else {
            res.status(401).json({ error: 'User not authenticated' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const successPage = async (req, res) => {
    const sessionId = req.query.session_id;
    const orderId = req.query.order_id;
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const order = await Order.findOne({ orderId }).populate('products.productId');

            if (order) {
                console.log('order before update:', order);
                order.paymentStatus = 'Completed';
                order.orderStatus = 'Completed';
                try {
                    await order.save();
                    await Cart.deleteMany({ user: order.userId });
                    res.render('user/success', { order });
                } catch (error) {
                    console.error('Error saving updated order', error.message);
                    res.status(500).send('Error saving updating order');
                }



            }
            else {
                res.status(404).send('Order not found');
            }
        } else {
            res.send('Payment not completed');
        }
    } catch (err) {
        console.error('Error retrieving session:', err.message);
        res.status(500).send('Internal server error');
    }
}


module.exports = { getCardPayment, successPage };