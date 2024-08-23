const axios = require('axios');
const uniqid = require('uniqid');
const sha256 = require('sha256');
const Order = require('../models/order_model');
const PHONE_PE_HOST_URL = 'https://api.phonepe.com/apis/hermes'
const SALT_INDEX = 1;
const payEndPoint = '/pg/v1/pay';
const statusEndPoint = '/pg/v1/status';
const MERCHANT_ID = 'M221LS4ADJ5UN'
const SALT_KEY = 'ffc08980-85e0-4247-a999-be8f8fec8cc8'

payController = async (req, res) => {
    const { userId } = req.body;
    const { products, totalAmount, address } = req.body; // Get the necessary data from the request body
    const merchantTransactionId = uniqid();
    const orderId = merchantTransactionId; // Use the transaction ID as the order ID

    const newOrder = new Order({
        userId: userId,
        orderId: orderId,
        products: products,
        totalAmount: totalAmount,
        products: products,
        address: address,
        orderStatus: "Pending", // Initial order status
        paymentStatus: "Pending", // Initial payment status
        orderDate: new Date().toISOString(),
    });

    // Save the new order to the database
    await newOrder.save();

    const payLoad = {
        "merchantId": MERCHANT_ID,
        "merchantTransactionId": merchantTransactionId,
        "merchantUserId": userId,
        "amount": 100,
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
        timeout: 10000,
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

                    // Payment is successful, update the order's payment status
                    // await Order.findOneAndUpdate(
                    //     { orderId: merchantTransactionId }, // Find the order by its ID
                    //     { paymentStatus: "Paid" }, // Update the payment status to "Paid"
                    //     { new: true } // Return the updated document
                    // );

                    // Send a success response
                    res.status(200).json({
                        message: 'Payment successful and order updated!',
                        paymentDetails: response.data,
                    });

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



module.exports = { payController, checkStatus }
