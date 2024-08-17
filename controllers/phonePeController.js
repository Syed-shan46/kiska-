const axios = require('axios');
const uniqid = require('uniqid');
const sha256 = require('sha256');
require('dotenv').config();
const Order = require('../models/order_model');
const PHONE_PE_HOST_URL = 'https://api.phonepe.com/apis/hermes'
const SALT_INDEX = 1
const payEndPoint = '/pg/v1/pay'



payController = async (req, res) => {
    const userId = req.body.userId
    const merchantTransactionId = uniqid();

    console.log("merchant id", merchantTransactionId)
    const payLoad = {
        "merchantId": process.env.MERCHANT_ID,
        "merchantTransactionId": merchantTransactionId,
        "merchantUserId": userId,
        "amount": 100,
        "redirectUrl":`https://kiska.in`,
        "redirectMode": "REDIRECT",
        "callbackUrl": `https://kiska.in/callback-url`,
        "paymentInstrument": {
            "type": "PAY_PAGE"
        },
    };

    const bufferObj = Buffer.from(JSON.stringify(payLoad), 'utf8');
    const base63EncodedPayLoad = bufferObj.toString('base64');
    console.log(base63EncodedPayLoad);
    const xVerify = sha256(base63EncodedPayLoad + payEndPoint + process.env.SALT_KEY) + '###' + SALT_INDEX;
    console.log(xVerify);

    const options = {
        method: 'POST',
        url: `${PHONE_PE_HOST_URL}${payEndPoint}`,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': xVerify,
        },
        timeout: 5000,
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


}

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.ADMIN_EMAIL,
//         pass: process.env.ADMIN_EMAIL_PASSWORD, 
//     }
// });

statusController = async (req, res) => {
    try {
        const { merchantTransactionId } = req.params;
        if (merchantTransactionId) {
            const xVerify = sha256(`/pg/v1/status/${process.env.MERCHANT_ID}/${merchantTransactionId}` + process.env.SALT_KEY) + '###' + SALT_INDEX;
            const options = {
                method: 'POST',
                url: `${PHONE_PE_HOST_URL}/pg/v1/status/${process.env.MERCHANT_ID}/${merchantTransactionId}`,
                headers: {
                    'Content-Type': 'application/json',
                    "X-MERCHANT-ID": process.env.MERCHANT_ID,
                    'X-VERIFY': xVerify,
                },
            };

            const response = await axios.request(options)
            if (response.data.code === 'PAYMENT_SUCCESS') { 
                // Payment success, generate the order
                // const newOrder = new Order({
                //     userId: req.body.userId,
                //     orderId: merchantTransactionId,
                //     products: req.body.products, // Assuming you have product details in the request
                //     totalAmount: req.body.totalAmount, // Assuming total amount is in the request
                //     orderStatus: 'Processing',
                //     paymentStatus: 'Completed',
                //     address: req.body.address, // Assuming address details are in the request
                //     orderDate: new Date()
                // });

                // const savedOrder = await newOrder.save();

                // Send email to admin with order details
                // const mailOptions = {
                //     from: process.env.ADMIN_EMAIL,
                //     to: process.env.ADMIN_EMAIL, // Admin email address
                //     subject: 'New Order Received',
                //     text: `A new order has been placed.\n\nOrder ID: ${savedOrder.orderId}\nTotal Amount: ${savedOrder.totalAmount}\nOrder Date: ${savedOrder.orderDate}\n\nPlease check the admin panel for more details.`,
                // };

                // await transporter.sendMail(mailOptions);

                res.send('Payment Success and Order Created');
            } else if (response.data.code === 'PAYMENT_ERROR') {
                res.send('Payment Error');
            } else {
                res.status(500).send({ error: 'Unexpected status code' });
            }
        } else {
            res.status(400).send({ error: 'Missing merchantTransactionId' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ error: 'Server Error' });
    }
};

callbackUrl = (req, res) => {

    const callbackData = req.body;


    // Example: Verify payment status, update order status, etc.
    console.log('Callback Data:', callbackData);

    // Respond to PhonePe
    res.send('Callback received');
}


module.exports = { payController, statusController, callbackUrl }