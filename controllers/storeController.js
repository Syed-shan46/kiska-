const Product = require('../models/product_model');

const storePage = async (req, res) => {
    try {
        const products = await Product.find();
        res.render('user/store', { products });
    } catch (error) {
        console.error(error);
    }

}

const categoryList = async (req, res) => {

    try {
        const products = await Product.find();
        res.render('user/category-list', { products });
    } catch (error) {
        console.error(error);
    }
}

const categoryColumns = (req, res) => {
    res.render('user/category-columns');
}

const category2Columns = (req, res) => {
    res.render('user/category-2columns');
}

module.exports = { storePage, categoryList, categoryColumns, category2Columns };