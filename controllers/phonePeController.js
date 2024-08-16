const axios = require('axios');
const uniqid = require('uniqid');
const sha256 = require('sha256');
const PHONE_PE_HOST_URL = 'https://api.phonepe.com/apis/hermes' //'https://api-preprod.phonepe.com/apis/pg-sandbox'
const SALT_INDEX = 1
const payEndPoint = '/pg/v1/pay'
MERCHANT_ID = 'M221LS4ADJ5UN'
SALT_KEY = 'ffc08980-85e0-4247-a999-be8f8fec8cc8'

// Function to generate a unique merchantUserId
const generateMerchantUserId = () => {
    const timestamp = Date.now();
    const randomString = uniqid();
    return `${timestamp}-${randomString}`.substring(0, 36); // Ensure the length is less than 36
};

const payController = async (req, res) => {
    try {
        const merchantTransactionId = uniqid();
        const merchantUserId = generateMerchantUserId(); // Generate the unique merchantUserId
        //const userId = req.body.userId || 12356784; // Use req.body if userId is dynamic

        const payLoad = {
            merchantId: process.env.MERCHANT_ID,
            merchantTransactionId,
            merchantUserId, // Include the unique merchantUserId
            amount: 100,
            redirectUrl: "https://webhook.site/36c133ad-2157-4920-9ef0-6cd63d10550a",
            redirectMode: "POST",
            callbackUrl: "https://webhook.site/36c133ad-2157-4920-9ef0-6cd63d10550a",
            mobileNumber: "9999999999",
            paymentInstrument: {
                type: "PAY_PAGE"
            }
        };

        const bufferObj = Buffer.from(JSON.stringify(payLoad), 'utf8');
        const base64EncodedPayload = bufferObj.toString('base64');
        const xVerify = sha256(base64EncodedPayload + payEndPoint + process.env.SALT_KEY) + '###' + SALT_INDEX;

        const options = {
            method: 'POST',
            url: `${PHONE_PE_HOST_URL}${payEndPoint}`,
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': xVerify,
            },
            data: {
                request: base64EncodedPayload,
            }
        };

        const response = await axios.request(options);
        console.log(response.data);

        if (response.data.data && response.data.data.instrumentResponse && response.data.data.instrumentResponse.redirectInfo) {
            const url = response.data.data.instrumentResponse.redirectInfo.url;
            res.redirect(url);
        } else {
            console.error('Unexpected response structure:', response.data);
            res.status(500).send({ error: 'Unexpected response structure' });
        }
    } catch (error) {
        console.error('Error from PhonePe API:', error.response ? error.response.data : error.message);
        res.status(500).send({ error: 'PhonePe API Error' });
    }
};

statusController = (req, res) => {
    const { merchantTransactionId } = req.params;
    if (merchantTransactionId) {
        const xVerify = sha256(`/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + SALT_KEY) + '###' + SALT_INDEX
        const options = {
            method: 'POST',
            url: `${PHONE_PE_HOST_URL}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                "X-MERCHANT-ID": MERCHANT_ID,
                'X-VERIFY': xVerify,
            },

        };
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data);
                if (response.data.code === 'PAYMENT_SUCCESS') {

                }
                else if (response.data.code === 'PAYMENT_ERROR') {
                    res.send('payment error');
                }
            })
            .catch(function (error) {
                console.error(error);
            });
        res.send({ merchantTransactionId });
    }
    else {
        res.send({ error: 'Error' });
    }
}

module.exports = { payController, statusController }