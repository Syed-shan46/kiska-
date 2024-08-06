const Order = require('../../models/order_model');
const User = require('../../models/user');

  

const getOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate({
            path: 'userId products.productId',
            select: 'name price image email' // Populate these fields from the Product model
        });
        res.render('admin/orders', { orders, isAdmin: true });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
}

const getOrderDetails = async (req, res) => {
    const { orderId } = req.params;
    try {
        const order = await Order.findById(orderId).populate('userId products.productId');

        if (!order) {
            return res.status(404).send('Order not found');
        }
        res.render('admin/order-details', { order, isAdmin: true });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
}

module.exports = { getOrders, getOrderDetails };