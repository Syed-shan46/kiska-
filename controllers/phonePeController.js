const axios = require('axios');
const uniqid = require('uniqid');
const sha256 = require('sha256');
const PHONE_PE_HOST_URL = 'https://api.phonepe.com/apis/hermes'
const SALT_INDEX = 1;
const Order = require('../models/order_model');
const payEndPoint = '/pg/v1/pay';
const statusEndPoint = '/pg/v1/status';
const MERCHANT_ID = 'M221LS4ADJ5UN'
const SALT_KEY = 'ffc08980-85e0-4247-a999-be8f8fec8cc8'

const payController = async (req, res) => {
    try {
        const { transactionId } = req.query; // Retrieve transaction ID from query parameters
        if (!transactionId) {
            throw new Error('Transaction ID is missing');
        }

        const order = await Order.findOne({ orderId: transactionId }); // Find order by transactionId
        if (!order) {
            throw new Error('Order not found');
        }

        const payLoad = {
            "merchantId": MERCHANT_ID,
            "merchantTransactionId": order.orderId,
            "merchantUserId": order.userId.toString(),
            "amount": order.totalAmount,
            "redirectUrl": `https://kiska.in/pay/validate/${order.orderId}`,
            "redirectMode": "REDIRECT",
            "callbackUrl": `https://kiska.in/pay/validate/${order.orderId}`,
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
        console.error('Error initiating payment:', error);
        res.status(500).json({ error: 'An error occurred while initiating payment' });
    }
};


const checkStatus = async (req, res) => {
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
                if (response.data && response.data.code === 'PAYMENT_SUCCESS') {
                    // Update order payment status to 'Paid'
                    const updatedOrder = await Order.findOneAndUpdate(
                        { orderId: merchantTransactionId },
                        { paymentStatus: "Paid" },
                        { new: true }
                    );

                    await updatedOrder.save();


                    res.status(200).json({
                        message: 'Payment successful and order updated!',
                        paymentDetails: response.data,
                    });

                } else {
                    res.send(response.data);
                }
            })
            .catch(function (error) {
                res.send(error);
            });

    } else {
        res.status(400).json({ message: 'Missing merchant transaction ID' });
    }
};


module.exports = { payController, checkStatus }
