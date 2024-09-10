const CategoryName = require('../../models/admin/category_model')
if (!req.session.adminEmail) {
    return res.redirect('404');
}
const categoryPage = (req, res) => {
    res.render('admin/add-category');
}

const addCategory = async (req, res) => {
    const { categoryName } = req.body;
    const newCategory = new CategoryName({
        categoryName,
    })
    try {
        await newCategory.save();
        res.redirect('/admin');
    } catch (error) {
        console.error(error);
    }

}

module.exports = { addCategory, categoryPage };