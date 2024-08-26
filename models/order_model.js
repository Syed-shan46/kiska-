const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: String, required: true },
    merchantTransactionId: {
        type: String,
        unique: true, // Ensure each transaction ID is unique
    },
    products: [
        {
            productId: { type: Schema.Types.ObjectId, ref: 'Product'},
            quantity: { type: Number,  }
        }
    ],
    totalAmount: { type: Number,  },
    orderStatus: { type: String, required: true },
    paymentStatus: { type: String, required: true },
    address: [
        {
            name: { type: String },
            house: { type: String },
            street: { type: String },
            city: { type: String },
            state: { type: String },
            zipCode: { type: String },
            phone: { type: Number },
        }
    ],
    orderDate: { type: Date, required: true }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
