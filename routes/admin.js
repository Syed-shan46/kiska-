var express = require('express');
var router = express.Router();
const { uploadProduct, updateProduct } = require('../controllers/admin/uploadController');
const { viewProduct } = require('../controllers/admin/viewController');
const { deleteController } = require('../controllers/admin/deleteController');
const { getProductDetails } = require('../controllers/admin/getProductController');
const { getOrderDetails, getOrders } = require('../controllers/admin/ordersController');
const { addCategory, categoryPage } = require('../controllers/admin/categoryController');
const Category = require('../models/admin/category_model');

/* GET home page. */
router.get('/', viewProduct);

router.get('/add-product', async (req, res) => {
  try {
    const categories = await Category.find();
    res.render('admin/add-product', { isAdmin: true, categories });
  } catch (error) {
    console.error(error);
  }
});


router.post('/upload', uploadProduct);
router.get('/delete', deleteController);
router.get('/edit/:id', getProductDetails);
router.post('/update-product/:id', updateProduct);

/// Orders
router.get('/orders', getOrders);
router.get('/orders/:orderId', getOrderDetails);

// Category
router.get('/add-category', categoryPage);
router.post('/submit-category', addCategory);



module.exports = router;
