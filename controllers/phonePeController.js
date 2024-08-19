const axios = require('axios');
const uniqid = require('uniqid');
const sha256 = require('sha256');
const Order = require('../models/order_model');
const PHONE_PE_HOST_URL = 'https://api.phonepe.com/apis/hermes'
const SALT_INDEX = 1;
const payEndPoint = '/pg/v1/pay';
const statusEndPoint = '/v3/transaction/status';
const MERCHANT_ID = 'M221LS4ADJ5UN'
const SALT_KEY = 'ffc08980-85e0-4247-a999-be8f8fec8cc8'

payController = async (req, res) => {
    const userId = req.body.userId
    const merchantTransactionId = uniqid();

    console.log("merchant id", merchantTransactionId)
    const payLoad = {
        "merchantId": MERCHANT_ID,
        "merchantTransactionId": merchantTransactionId,
        "merchantUserId": userId,
        "amount": 100,
        "redirectUrl": `https://kiska.in/payment/status?transactionId=${merchantTransactionId}`,
        "redirectMode": "REDIRECT",
        "callbackUrl": `https://kiska.in/payment/status?transactionId=${merchantTransactionId}`,
        "paymentInstrument": {
            "type": "PAY_PAGE"
        },
    };

    const bufferObj = Buffer.from(JSON.stringify(payLoad), 'utf8');
    const base63EncodedPayLoad = bufferObj.toString('base64');
    console.log(base63EncodedPayLoad);
    const xVerify = sha256(base63EncodedPayLoad + payEndPoint + SALT_KEY) + '###' + SALT_INDEX;
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

const statusController = async (req, res) => {
    const { transactionId } = req.query;

    const statusPayload = {
        merchantId: MERCHANT_ID,
        merchantTransactionId: transactionId
    };

    const bufferObj = Buffer.from(JSON.stringify(statusPayload), 'utf8');
    const base63EncodedStatusPayload = bufferObj.toString('base64');
    const xVerify = sha256(base63EncodedStatusPayload + statusEndPoint + SALT_KEY) + '###' + SALT_INDEX;

    const options = {
        method: 'POST',
        url: `${PHONE_PE_HOST_URL}${statusEndPoint}`,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': xVerify,
        },
        timeout: 5000,
        data: {
            request: base63EncodedStatusPayload,
        }
    };

    try {
        const paymentStatusResponse = await axios.request(options);

        if (paymentStatusResponse.data.success) {
            const paymentData = paymentStatusResponse.data.data;

            // Create the order if the payment is successful
            const orderDetails = {
                userId: req.user._id, // Assuming user is authenticated
                orderId: paymentData.merchantTransactionId,
                products: req.body.products, // Include products from the request body or session
                totalAmount: paymentData.amount / 100, // Adjust for currency
                paymentStatus: 'Paid',
                orderStatus: 'Processing',
                address: req.body.address, // Include address from the request body or session
                orderDate: new Date()
            };

            const newOrder = new Order(orderDetails);
            await newOrder.save();

            // Redirect the user to the order confirmation page
            res.redirect('/order-confirmation?orderId=' + newOrder._id);
        } else {
            // Handle payment failure
            res.redirect('/payment-failed');
        }
    } catch (error) {
        console.error('Error in statusController:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


callbackUrl = (req, res) => {

    const callbackData = req.body;


    // Example: Verify payment status, update order status, etc.
    console.log('Callback Data:', callbackData);

    // Respond to PhonePe
    res.send('Callback received');
}


module.exports = { payController, callbackUrl, statusController }