const axios = require('axios');
const uniqid = require('uniqid');
const sha256 = require('sha256');
const PHONE_PE_HOST_URL = 'https://api.phonepe.com/apis/hermes' //'https://api-preprod.phonepe.com/apis/pg-sandbox'
const SALT_INDEX = 1
const payEndPoint = '/pg/v1/pay'
const merchantTransactionId = uniqid();
const userId = 12356784;

payController = (req, res) => {

    console.log("merchant id", merchantTransactionId)
    const payLoad = {
        "merchantId": process.env.MERCHANT_ID,
        "merchantTransactionId": merchantTransactionId,
        "merchantUserId": userId,
        "amount": 3000,
        "redirectUrl": "https://kiska.in",
        "redirectMode": "POST",
        "callbackUrl": "https://kiska.in",
        "mobileNumber": "9999999999",
        "paymentInstrument": {
            "type": "PAY_PAGE"
        }
    };

    const bufferObj = Buffer.from(JSON.stringify(payLoad), 'utf8');
    const base63EncodedPayLoad = bufferObj.toString('base64');
    //const base63EncodedPayLoad = 'ewogICJtZXJjaGFudElkIjogIlBHVEVTVFBBWVVBVDc3IiwKICAibWVyY2hhbnRUcmFuc2FjdGlvbklkIjogIjNmZzg3MGx6dzlmc240IiwKICAibWVyY2hhbnRVc2VySWQiOiAxMjM1Njc4NCwKICAiYW1vdW50IjogMzAwMCwKICAicmVkaXJlY3RVcmwiOiAiaHR0cHM6Ly93ZWJob29rLnNpdGUvMzZjMTMzYWQtMjE1Ny00OTIwLTllZjAtNmNkNjNkMTA1NTBhIiwKICAicmVkaXJlY3RNb2RlIjogIlBPU1QiLAogICJjYWxsYmFja1VybCI6ICJodHRwczovL3dlYmhvb2suc2l0ZS8zNmMxMzNhZC0yMTU3LTQ5MjAtOWVmMC02Y2Q2M2QxMDU1MGEiLAogICJtb2JpbGVOdW1iZXIiOiAiOTk5OTk5OTk5OSIsCiAgInBheW1lbnRJbnN0cnVtZW50IjogewogICAgInR5cGUiOiAiUEFZX1BBR0UiCiAgfQp9'
    console.log(base63EncodedPayLoad);
    const xVerify = sha256(base63EncodedPayLoad + payEndPoint + process.env.SALT_KEY) + '###' + SALT_INDEX;
    console.log(xVerify);

    const options = {
        method: 'POST',
        url: `${PHONE_PE_HOST_URL}${payEndPoint}`,
        headers: {
            //accept: 'application/json',
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
            res.send({ error: 'PhonePe API Error' });
        });

    res.send('Payment processed');
}

statusController = (req, res) => {
    const { merchantTransactionId } = req.params;
    if (merchantTransactionId) {
        const xVerify = sha256(`/pg/v1/status/${process.env.MERCHANT_ID}/${merchantTransactionId}` + SALT_KEY) + '###' + SALT_INDEX
        const options = {
            method: 'POST',
            url: `${PHONE_PE_HOST_URL}/pg/v1/status/${process.env.MERCHANT_ID}/${merchantTransactionId}`,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                "X-MERCHANT-ID": process.env.MERCHANT_ID,
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