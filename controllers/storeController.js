const Product = require('../models/product_model');

const storePage = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const category = req.query.category || null;

    try {
        const categories = await Product.distinct('category');

        // Build the query object based on the category filter
        const query = category ? { category } : {};

        // Count the total number of products based on the current filter
        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        // Fetch products for the current page based on the filter
        const products = await Product.find(query)
            .sort({ updatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.render('user/store', {
            products,
            categories,
            currentPage: page,
            totalPages: totalPages > 1 ? totalPages : null, // Only show pagination if more than one page
            category
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }

}

const productsByCategory = async (req, res) => {
    try {
        const { categories, page = 1 } = req.query;
        const perPage = 3; // Number of products per page
        const query = {};

        if (categories && categories.length > 0) {
            query.category = { $in: categories };
        }

        // Fetch products with pagination and filters
        const products = await Product.find(query)
            .skip((page - 1) * perPage)
            .limit(perPage);

        const totalCount = await Product.countDocuments(query); // Get total count of filtered products
        const totalPages = Math.ceil(totalCount / perPage); // Calculate total pages

        res.json({
            products,
            totalPages
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
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

module.exports = {
    storePage,
    categoryList,
    categoryColumns,
    category2Columns,
    productsByCategory,
};