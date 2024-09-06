const axios = require('axios');
const uniqid = require('uniqid');
const sha256 = require('sha256');
const PHONE_PE_HOST_URL = 'https://api.phonepe.com/apis/hermes'
const SALT_INDEX = 1;
const Order = require('../models/order_model');
const payEndPoint = '/pg/v1/pay';
const statusEndPoint = '/pg/v1/status';
require('dotenv').config();
const { sendOrderConfirmationEmail, sendOrderNotificationToAdmin } = require('../controllers/mailController')

const MERCHANT_ID = 'M221LS4ADJ5UN'
const SALT_KEY = 'ffc08980-85e0-4247-a999-be8f8fec8cc8'

payController = async (req, res) => {
    try {
        const userId = req.body;
        console.log("Phonepe userId :", userId);

        //const { products, totalAmount, address } = req.body; // Get the necessary data from the request body
        //const merchantTransactionId = uniqid();
        //const merchantTransactionId = req.body.merchantTransactionId || req.params.merchantTransactionId;
        const { merchantTransactionId, totalAmount } = req.body || req.params;
        console.log('total amount:', totalAmount);
        console.log('merchantTransactionId:', merchantTransactionId);



        //const { userId } = req.body; // Assuming you have a session with userId

        // // Find the order for the user with pending payment status
        // const order = await Order.findOne({  paymentStatus: 'pending' });

        // if (!order) {
        //     return res.status(404).json({ error: 'No pending order found for the user' });
        // }

        // const merchantTransactionId = order.merchantTransactionId;
        // console.log(merchantTransactionId);


        const payLoad = {
            "merchantId": MERCHANT_ID,
            "merchantTransactionId": merchantTransactionId,
            "merchantUserId": userId,
            "amount": totalAmount * 100,
            "redirectUrl": `https://kiska.in/pay/validate/${merchantTransactionId}`,
            "redirectMode": "REDIRECT",
            "callbackUrl": `https://kiska.in/pay/validate/${merchantTransactionId}`,
            "paymentInstrument": {
                "type": "PAY_PAGE"
            },
        };

        const bufferObj = Buffer.from(JSON.stringify(payLoad), 'utf8');
        const base63EncodedPayLoad = bufferObj.toString('base64');

        const xVerify = sha256(base63EncodedPayLoad + payEndPoint + SALT_KEY) + '###' + SALT_INDEX;

        const options = {
            method: 'POST',
            url: `${PHONE_PE_HOST_URL}${payEndPoint}`,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': xVerify,
            },
            data: {
                request: base63EncodedPayLoad,
            }
        };
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data);
                if (response.data.data && response.data.data.instrumentResponse && response.data.data.instrumentResponse.redirectInfo) {
                    const url = response.data.data.instrumentResponse.redirectInfo.url;
                    res.redirect(url);
                } else {
                    console.error('Unexpected response structure:', response.data);
                    res.send({ error: 'Unexpected response structure' });
                }
            })
            .catch(function (error) {
                console.error('Error from PhonePe API:', error.response ? error.response.data : error.message);
                res.send(error);
            });

    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'An error occurred while creating the order' });
    }
}

checkStatus = async (req, res) => {
    const { merchantTransactionId } = req.params;

    if (merchantTransactionId) {
        let statusUrl = `${PHONE_PE_HOST_URL}${statusEndPoint}/${MERCHANT_ID}/${merchantTransactionId}`;
        let string = `${statusEndPoint}/${MERCHANT_ID}/${merchantTransactionId}${SALT_KEY}`;
        let sha256_val = sha256(string);
        let xVerifyCheckSum = sha256_val + '###' + SALT_INDEX;

        axios.get(statusUrl, {
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': xVerifyCheckSum,
                'X-MERCHANT-ID': MERCHANT_ID,

            }
        })
            .then(async function (response) {
                console.log('response->', response.data)
                if (response.data && response.data.code === 'PAYMENT_SUCCESS') {
                    // Update the order's payment status to "Paid"
                    const updatedOrder = await Order.findOneAndUpdate(
                        { merchantTransactionId: merchantTransactionId }, // Find the order by its ID
                        { paymentStatus: "Paid" }, // Update the payment status to "Paid"
                        { new: true } // Return the updated document
                    ).populate({
                        path: 'products.productId',
                        model: 'Product',
                        select: 'name price',
                    })
                        .populate('userId', 'email')
                        .populate('addressId')
                        .exec();

                    if (updatedOrder) {
                        // Ensure `userId` contains the email field and send order confirmation email to the user
                        await sendOrderConfirmationEmail(updatedOrder, updatedOrder.userId.email);
                        console.log('Order confirmation email sent to user successfully.');

                        // Send order notification email to admin
                        await sendOrderNotificationToAdmin(updatedOrder);
                        console.log('Order notification email sent to admin successfully.');

                        res.redirect(`/success/${updatedOrder._id}`);
                    } else {
                        console.error('Order not found with the provided merchantTransactionId.');
                    }

                    res.redirect('/success');
                }
                else {
                    res.send(response.data);
                }
            })
            .catch(function (error) {
                res.send(error);
            })

    }
    else {
        res.status(400).json({ message: 'Missing merchant transaction ID' });
    }
}

const getOrderSuccess = async (req, res) => {
    const orderId = req.params.id;

    try {
        // Find the order by ID and populate necessary fields
        const order = await Order.findById(orderId)
            .populate('products.productId')  // Populates product details
            .populate('userId')              // Optionally populate user data
            .populate('addressId');          // Populate the address if needed

        if (!order) {
            return res.status(404).send('Order not found');
        }

        // Render the success page and pass the order details (totalAmount, products, etc.)
        res.render('user/success', { order });
    } catch (error) {
        res.status(500).send('Server error');
    }
};




module.exports = { payController, checkStatus, getOrderSuccess }
