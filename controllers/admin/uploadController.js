const Product = require('../../models/product_model');

const multer = require('multer');

/* Multer Setup */
const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        return cb(null, "./public/images");
    },
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}-${file.originalname}`);
    },
})
const upload = multer({ storage })

/* Add product Products */
const uploadProduct = [upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'images', maxCount: 4 },
]),
async (req, res) => {
    const { name, description, category, price } = req.body
    // Multiple images handling
    const images = req.files['images'] ? req.files['images'].map(file => file.filename) : [];
    // Single image handling
    const mainImage = req.files['mainImage'] ? req.files['mainImage'][0].filename : '';

    const newProduct = new Product({
        name,
        description,
        category,
        images,
        mainImage,
        price,
    });

    try {
        await newProduct.save();
        res.redirect('/admin');

    } catch (error) {
        res.status(500).send('Error adding product');
    }
}
];

const updateProduct = [upload.fields([
    { name: 'mainImage', maxCount: 1 }, // Single image
    { name: 'images', maxCount: 4 } // Multiple images
]),
async (req, res) => {
    const { _id, name, description, category, price } = req.body;

    try {
        // Find the existing product
        const product = await Product.findById(_id);

        if (!product) {
            return res.status(404).send('Product not found');
        }

        // Update the product fields
        product.name = name;
        product.description = description;
        product.category = category;
        product.price = price;

        // Check and update the single image if provided
        if (req.files['mainImage']) {
            product.mainImage = req.files['mainImage'][0].filename;
        }

        // Check and update the multiple images if provided
        if (req.files['images']) {
            product.images = req.files['images'].map(file => file.filename);
        }

        // Save the updated product
        await product.save();

        res.redirect('/admin');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating product');
    }
}
]


module.exports = { uploadProduct, updateProduct }