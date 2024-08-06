const CategoryName = require('../../models/admin/category_model')
const categoryPage = (req, res) => {
    res.render('admin/add-category');
}

const addCategory = async (req, res) => {
    const { categoryName } = req.body;
    const newCategory = new CategoryName({
        categoryName,
    })
    try {
        await  newCategory.save();
        res.redirect('/admin');
    } catch (error) {
        console.error(error);
    } 
    
}

module.exports = { addCategory, categoryPage };