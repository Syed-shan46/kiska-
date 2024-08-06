const Product = require('../../models/product_model');
const Category = require('../../models/admin/category_model');

const getProductDetails = async (req, res) => {
    try {
        const categories = await Category.find();
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.render('admin/edit-product', { product, categories, isAdmin: true });
    } catch (err) {
        res.status(500).json({ message: 'Server error', err });
    }
}

module.exports = { getProductDetails };