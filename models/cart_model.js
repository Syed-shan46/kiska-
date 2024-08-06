const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartItemSchema = new mongoose.Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    product:{ type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1, required: true },
    eachTotal: {
        type: Number, required: true, default: 0,
    },
});

cartItemSchema.pre('save', async function (next) {
    if (this.isNew || this.isModified('quantity')) {
        const product = await mongoose.model('Product').findById(this.product);
        this.eachTotal = product.price * this.quantity;
    }
    next();
})

const CartItem = mongoose.model('CartItem', cartItemSchema);
module.exports = CartItem;