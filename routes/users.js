var express = require('express');
var router = express.Router();
const Order = require('../models/order_model');

const { viewUserProduct } = require('../controllers/admin/viewController');
const { handleRegister, handleLogin, handleLogout, registerPage } = require('../controllers/authController');
const { postAddress, getAddress, updateUserProfile, getProfile, getUpdateAddress, viewAllAddress, postUpdateAddress, getOrders } = require('../controllers/profileController');
//const { getCardPayment, successPage } = require('../controllers/stripeController');
const { getCart, addToCart, cartIncrease, cartDecrease, cartRemove } = require('../controllers/cartController');
const { viewSingleItem } = require('../controllers/productController');
const { addAddress } = require('../controllers/addressController');
const { checkoutPage, PendingOrder } = require('../controllers/checkoutController');
const { storePage, categoryList, categoryColumns, category2Columns } = require('../controllers/storeController');
const { payController, checkStatus } = require('../controllers/phonePeController');


/* GET users listing. */
router.get('/', viewUserProduct);

/// Authentication
router.get('/register', (req, res) => {
    res.render('user/register')
});
router.get('/login', (req, res) => {
    res.render('user/login');
});
router.post('/createuser', handleRegister);
router.post('/loginUser', handleLogin);
router.post('/logout', handleLogout);

/// Cart Functions
router.get('/cart', getCart);
router.post('/cart/add', addToCart);
router.post('/cart/increase', cartIncrease);
router.post('/cart/decrease', cartDecrease);
router.post('/cart/remove', cartRemove);
router.post('/remove', cartRemove);


/// View single item
router.get('/product/:id', viewSingleItem);
router.get('/cart/checkout', checkoutPage);
router.post('/pendingOrder', PendingOrder);
router.get('/cart/checkout/method', (req, res) => {
    const userId = req.session.userId;
    const merchantTransactionId = req.query.merchantTransactionId;
    res.render('user/method', { userId, merchantTransactionId });
});


/// Success route
router.get('/success', (req, res) => {
    res.render('user/success');
})


/// Profile
router.get('/profile', getAddress);
/// Address 

router.get('/profile/address', addAddress);
router.get('/profile/address/edit/:id', getUpdateAddress);
router.post('/profile/address/update/:id', postUpdateAddress)
router.get('/profile/viewAllAddress', viewAllAddress);
router.post('/post-address', postAddress);
router.get('/profile/update', getProfile)
router.post('/profile/update', updateUserProfile);
router.get('/profile/orders/:id', getOrders);
module.exports = router;

/// Store
router.get('/store', storePage);
router.get('/category-list', categoryList);
router.get('/category-columns', categoryColumns)
router.get('/category-2columns', category2Columns);

/// refund 
router.get('/refcan', (req, res) => {
    res.render('user/refund-cancel');
});

router.get('/tnc', (req, res) => {
    res.render('user/TnConditions')
})

router.get('/privacy', (req, res) => {
    res.render('user/pv');
})

router.post('/pay', payController);

router.get('/pay/validate/:merchantTransactionId', checkStatus);

router.get('/check', async (req, res) => {
    try {
        const orders = await Order.find(); // Fetch all orders
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

