const CartItem = require('../models/cart_model');
const mongoose = require('mongoose');

const getCart = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.redirect('/register');
        }

        // find cart items for logged in user 
        const cartItems = await CartItem.find({ user: userId }).populate('product');
        let totalAmount = 0;
        cartItems.forEach(item => {
            totalAmount += item.product.price * item.quantity
        })

        // Render the cart page with the items 
        res.render('user/cart', {
            cartItems,
            isLoggedIn: !!req.session.userId,
            totalAmount,
        });
    } catch (error) {
        console.error('Error retrieving cart items:', error);
        res.status(500).send('Error retrieving cart items');
    }
}

const addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;


        // Ensure userId and productId are valid ObjectId instances
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.redirect('/register');
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);
        const productObjectId = new mongoose.Types.ObjectId(productId);

        // Create or update cart item
        let cartItem = await CartItem.findOne({ user: userObjectId, product: productObjectId });
        if (cartItem) {
            // Increment quantity if item already in cart
            cartItem.quantity += 1;
        } else {
            // Add new item to cart
            cartItem = new CartItem({
                user: userObjectId,
                product: productObjectId,
                quantity: 1
            });
        }
        await cartItem.save();

        res.redirect('/cart');
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).send('Error adding to cart');
    }
}

const cartIncrease = async (req, res) => {
    try {
        const { cartItemId } = req.body;
        if (!mongoose.Types.ObjectId.isValid(cartItemId)) {
            return res.status(400).send('Invalid cart item ID');
        }

        const cartItem = await CartItem.findById(cartItemId).populate('product');
        cartItem.quantity += 1;
        cartItem.eachTotal = cartItem.product.price * cartItem.quantity;
        await cartItem.save();
        res.redirect('/cart');
    } catch (error) {
        console.error('Error increasing quantity"', error);
        res.status(500).send('Error increasing quantity');
    }
}

const cartDecrease = async (req, res) => {
    try {
        const { cartItemId } = req.body;
        const cartItem = await CartItem.findById(cartItemId);

        if (cartItem && cartItem.quantity > 1) {
            cartItem.quantity -= 1;
            await cartItem.save();
        }
        res.redirect('/cart');
    } catch (error) {
        console.error('Error decreasing quantity');
        res.status(500).send('Error decreasing quantity');
    }
}

const cartRemove = async (req, res) => {
    try {
        const { cartItemId } = req.body;
        if (!mongoose.Types.ObjectId.isValid(cartItemId)) {
            return res.status(400).send('Invalid cart item ID');
        }
        await CartItem.findByIdAndDelete(cartItemId);
        res.redirect('/cart');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error removing cart item');
    }
}



module.exports = { getCart, addToCart, cartIncrease, cartDecrease, cartRemove }

