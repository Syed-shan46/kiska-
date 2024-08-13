const axios = require('axios');
const uniqid = require('uniqid');
const sha256 = require('sha256');
const PHONE_PE_HOST_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox'
const MERCHANT_ID = 'UATM221LS4ADJ5UN'
const SALT_INDEX = 1
const SALT_KEY = 'accaf302-67f3-4b26-8142-6066047d40fa'
const payEndPoint = '/pg/v1/pay';
const merchantTransactionId = uniqid();
const userId = 123;

payController = (req, res) => {


    const payLoad = {
        "merchantId": MERCHANT_ID,
        "merchantTransactionId": merchantTransactionId,
        "merchantUserId": userId,
        "amount": 30000,
        "redirectUrl": `http://localhost:3000/redirect-url/${merchantTransactionId}`,
        "redirectMode": "REDIRECT",
        "mobileNumber": "9999999999",
        "paymentInstrument": {
            "type": "PAY_PAGE"
        }
    };

    const bufferObj = Buffer.from(JSON.stringify(payLoad), 'utf8');
    const base63EncodedPayLoad = bufferObj.toString('base64');
    const xVerify = sha256(base63EncodedPayLoad + payEndPoint + SALT_KEY) + '###' + SALT_INDEX

    const options = {
        method: 'post',
        url: `${PHONE_PE_HOST_URL}${payEndPoint}`,
        headers: {
            accept: 'application/json',
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
            const url = response.data.data.instrumentResponse.redirectInfo.url;
            res.redirect(url);
            //res.send({ url });
        })
        .catch(function (error) {
            console.error(error);
        });
}

statusController = (req, res) => {
    const { merchantTransactionId } = req.params;
    if (merchantTransactionId) {
        const xVerify = sha256(`/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + SALT_KEY) + '###' + SALT_INDEX
        const options = {
            method: 'get',
            url: `${PHONE_PE_HOST_URL}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                "X-MERCHANT-ID": merchantTransactionId,
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