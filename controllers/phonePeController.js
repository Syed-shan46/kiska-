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
    const userId = req.body.userId
    const merchantTransactionId = uniqid();

    console.log("merchant id", merchantTransactionId)
    const payLoad = {
        "merchantId": MERCHANT_ID,
        "merchantTransactionId": merchantTransactionId,
        "merchantUserId": userId,
        "amount": 100,
        "redirectUrl": `https://kiska.in/order-check?transactionId=${merchantTransactionId}`,
        "redirectMode": "REDIRECT",
        "callbackUrl": `https://kiska.in/order-check?transactionId=${merchantTransactionId}`,
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

statusController = async (req, res) => {
    const { merchantTransactionId } = req.params;

    if (merchantTransactionId) {
        const statusPayload = {
            merchantId: MERCHANT_ID,
            merchantTransactionId: merchantTransactionId
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
            const response = await axios.request(options);
            console.log('Status Response:', response.data);

            if (response.data.code === 'PAYMENT_SUCCESS') {
                const paymentData = response.data.data;

                // Create the order if the payment is successful
                const orderDetails = {
                    userId: req.user._id, // Ensure user is authenticated
                    orderId: paymentData.merchantTransactionId,
                    products: req.body.products, // Adjust as needed
                    totalAmount: paymentData.amount / 100, // Adjust for currency
                    paymentStatus: 'Paid',
                    orderStatus: 'Processing',
                    address: req.body.address, // Adjust as needed
                    orderDate: new Date()
                };

                try {
                    const newOrder = new Order(orderDetails);
                    await newOrder.save();
                    // Redirect to the order-check page with the order ID
                    res.redirect(`/order-check?orderId=${newOrder._id}`);
                } catch (dbError) {
                    console.error('Database Error:', dbError);
                    res.status(500).json({ success: false, message: 'Database Error', details: dbError.message });
                }
            } else if (response.data.code === 'PAYMENT_ERROR') {
                res.redirect('/payment-failed');
            } else {
                res.redirect('/payment-pending');
            }
        } catch (error) {
            console.error('Error in statusController:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    } else {
        res.send({ error: 'Transaction ID is required' });
    }
}

orderCheck = async (req, res) => {
    const { orderId } = req.query;

    if (!orderId) {
        return res.status(400).send('Order ID is required');
    }

    try {
        const order = await Order.findById(orderId).populate('products.productId'); // Assuming products have productId references
        if (!order) {
            return res.status(404).send('Order not found');
        }

        // Render the order-check view and pass the order data
        res.render('order-check', { order });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).send('Server error');
    }
}

module.exports = { payController,  statusController, orderCheck }