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

payController = async (req, res) => {
    try {
        const userId = req.body;

        //const { products, totalAmount, address } = req.body; // Get the necessary data from the request body
        const merchantTransactionId = uniqid();
        //const orderId = '66aba1b4dccc4c7e57efcbab'; // Use the transaction ID as the order ID

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
        // const newOrder = new Order(
        //     {
        //         "userId": userId,
        //         "orderId": orderId,
        //         "products": [
        //             {
        //                 "productId": "64f5e6b98b5f9c0012345679",
        //                 "quantity": 2,
        //                 "_id": "66c82165ad2afa8d5b17efe2"
        //             },
        //             {
        //                 "productId": "64f5e6b98b5f9c001234567a",
        //                 "quantity": 1,
        //                 "_id": "66c82165ad2afa8d5b17efe3"
        //             }
        //         ],
        //         "totalAmount": totalAmount,
        //         "orderStatus": "Pending",
        //         "paymentStatus": "Pending",
        //         "address": [
        //             {
        //                 "name": "John Doe",
        //                 "house": "1234",
        //                 "street": "Main Street",
        //                 "city": "New York",
        //                 "state": "NY",
        //                 "zipCode": "10001",
        //                 "phone": 1234567890,
        //                 "_id": "66c82165ad2afa8d5b17efe4"
        //             }
        //         ],
        //         "orderDate": "2024-08-23T12:00:00.000Z",
        //         "__v": 0
        //     }
        // );

        // //Save the new order to the database
        // await newOrder.save();
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
                        { paymentStatus: "Paid"}, // Update the payment status to "Paid"
                        { new: true } // Return the updated document
                    );

                    

                    res.status(200).json({
                        message: 'Payment successful and order updated!',
                        paymentDetails: response.data,
                        order: updatedOrder
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
