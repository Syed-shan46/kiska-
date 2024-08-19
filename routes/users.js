var express = require('express');
var router = express.Router();
const Order = require('../models/order_model');

const { viewUserProduct } = require('../controllers/admin/viewController');
const { handleRegister, handleLogin, handleLogout, registerPage } = require('../controllers/authController');
const { postAddress, getAddress } = require('../controllers/profileController');
const { getCardPayment, successPage } = require('../controllers/stripeController');
const { getCart, addToCart, cartIncrease, cartDecrease, cartRemove } = require('../controllers/cartController');
const { viewSingleItem } = require('../controllers/productController');
const { addAddress } = require('../controllers/addressController');
const { checkoutPage } = require('../controllers/checkoutController');
const { storePage, categoryList, categoryColumns, category2Columns } = require('../controllers/storeController');
const { payController, statusController, orderCheck } = require('../controllers/phonePeController');


/* GET users listing. */
router.get('/', viewUserProduct);

/// Authentication
router.get('/register', registerPage)
router.post('/createuser', handleRegister);
router.post('/login', handleLogin);
router.post('/logout', handleLogout);

/// Cart Functions
router.get('/cart', getCart);
router.post('/cart/add', addToCart);
router.post('/cart/increase', cartIncrease)
router.post('/cart/decrease', cartDecrease)
router.post('/cart/remove', cartRemove);
router.post('/remove', cartRemove);

/// View single item
router.get('/product/:id', viewSingleItem);
router.get('/cart/checkout', checkoutPage);

/// Stripe Payment
router.post('/create-payment', getCardPayment);
router.get('/success', (req, res) => {
    res.render('user/success');
});

/// Profile
router.get('/profile', getAddress);
/// Address
router.get('/profile/address', addAddress);
router.post('/post-address', postAddress);
module.exports = router;

/// Store
router.get('/store', storePage);
router.get('/category-list', categoryList);
router.get('/category-columns', categoryColumns)
router.get('/category-2columns', category2Columns);

/// refund 
router.get('/refcan', (req, res) => {
    res.render('user/refund-cancel');
})



router.get('/tnc', (req, res) => {
    res.render('user/TnConditions')
})

router.get('/privacy', (req, res) => {
    res.render('user/pv');
})

router.post('/pay', payController);



router.get('/order-check', statusController);

router.get('/order-check', orderCheck);


