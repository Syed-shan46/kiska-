const session = require('express-session');
const Product = require('../../models/product_model');
const CartItem = require('../../models/cart_model');


const viewProduct = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;

    try {
        const totalProducts = await Product.countDocuments({});
        const products = await Product.find({})
            .sort({ updatedAt: -1 }).
            skip((page - 1) * limit)
            .limit(limit);
        res.render('admin/view-product', {
            products,
            isAdmin: true,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            limit,
        });
    } catch (error) {

    }
}

const viewUserProduct = async (req, res, next) => {
    try {
        const userData = {
            cartItems: req.session.cartItems || []
        };

        // Retrieve userId from session
        const userId = req.session.userId;

        // Fetch all products from the database
        const products = await Product.find();

        let cartItems = [];
        if (userId) {
            cartItems = CartItem.find({ user: userId }).populate('product');
        }

        // Render the index page with products, login status, and userId
        res.render('index', {
            products,
           
            userData,
            isLoggedIn: !!req.session.userId, // Check if userId exists to determine login status
            userId,
            isAdmin: false,
        });
    } catch (error) {
        console.error(error);
        // Handle errors by sending a 500 status and an error message
        res.status(500).send("Error retrieving product");
    }
};


module.exports = { viewProduct, viewUserProduct }