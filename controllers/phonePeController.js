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
        "redirectUrl": `https://kiska.in/pay/validate/${merchantTransactionId}`,
        "redirectMode": "REDIRECT",
        "callbackUrl": `https://kiska.in/pay/validate/${merchantTransactionId}`,
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
                console.log('response->', response.data);
                if (response.data && response.data.code === 'PAYMENT_SUCCESS') {
                    const { userId, products, totalAmount, address } = req.body; // Assuming these are coming in the request body

                    // Create a new order
                    const newOrder = new Order(
                        {
                            "userId": "64f5e6b98b5f9c0012345678",  // Example ObjectId of a user
                            "orderId": "ORD12345678",  // Unique identifier for the order
                            "products": [
                              {
                                "productId": "64f5e6b98b5f9c0012345679",  // Example ObjectId of a product
                                "quantity": 2
                              },
                              {
                                "productId": "64f5e6b98b5f9c001234567a",  // Example ObjectId of another product
                                "quantity": 1
                              }
                            ],
                            "totalAmount": 150.75,  // Total amount for the order
                            "orderStatus": "Pending",  // Initial status of the order
                            "paymentStatus": "Paid",  // Status of the payment
                            "address": [
                              {
                                "name": "John Doe",
                                "house": "1234",
                                "street": "Main Street",
                                "city": "New York",
                                "state": "NY",
                                "zipCode": "10001",
                                "phone": 1234567890
                              }
                            ],
                            "orderDate": "2024-08-23T12:00:00Z"  // ISO date string representing the date the order was placed
                          }
                    );

                    // Save the order to the database
                    await newOrder.save();

                    // Send a success response
                    res.status(200).json({
                        message: 'Order created successfully!',
                        order: newOrder,
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