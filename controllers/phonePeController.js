const axios = require('axios');
const uniqid = require('uniqid');
const sha256 = require('sha256');
const PHONE_PE_HOST_URL = 'https://api.phonepe.com/apis/hermes'
const SALT_INDEX = 1
const payEndPoint = '/pg/v1/pay'

const MERCHANT_ID = 'M221LS4ADJ5UN'
const SALT_KEY = 'ffc08980-85e0-4247-a999-be8f8fec8cc8'


payController = async (req, res) => {

    try {
        const userId = req.body.userId

        console.log("merchant id", merchantTransactionId)
        const merchantTransactionId = uniqid();
        const payLoad = {
            "merchantId": MERCHANT_ID,
            "merchantTransactionId": merchantTransactionId,
            "merchantUserId": userId,
            "amount": 100,
            "redirectUrl": `https://kiska.in/redirect-url/${merchantTransactionId}`,
            "redirectMode": "POST",
            "callbackUrl": `https://kiska.in/callback-url`,
            "paymentInstrument": {
                "type": "PAY_PAGE"
            }
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
    } catch (error) {
        res.send(error)
    }

}

statusController = (req, res) => {
    const { merchantTransactionId } = req.params;
    if (merchantTransactionId) {
        const xVerify = sha256(`/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + SALT_KEY) + '###' + SALT_INDEX
        const options = {
            method: 'POST',
            url: `${PHONE_PE_HOST_URL}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`,
            headers: {
                //accept: 'application/json',
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
                    const statusResponse = {
                        "success": true,
                        "code": "PAYMENT_SUCCESS",
                        "message": "Your request has been successfully completed.",
                        "data": {
                            "merchantId": "PGTESTPAYUAT",
                            "merchantTransactionId": "MT7850590068188104",
                            "transactionId": "T2111221437456190170379",
                            "amount": 100,
                            "state": "COMPLETED",
                            "responseCode": "SUCCESS",
                            "paymentInstrument": {
                                "type": "UPI",
                                "utr": "206378866112"
                            }
                        }
                    }
                    res.send('Payment Success');
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

callbackUrl = (req, res) => {

    const callbackData = req.body;


    // Example: Verify payment status, update order status, etc.
    console.log('Callback Data:', callbackData);

    // Respond to PhonePe
    res.send('Callback received');
}


module.exports = { payController, statusController, callbackUrl }