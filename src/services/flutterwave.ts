import axios from 'axios'
const { MERCHANT_TITLE, MERCHANT_DESCRIPTION, MERCHANT_LOGO } = process.env

const ACCEPTED_CURRENCY = "NGN"


export const validatePayment = async (transactionId, expectedAmount, expectedReference) => {
    console.log("validation began")
    const URL = `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`
    try {
        const { data } = await axios.get(URL, {
            headers: {
                'Authorization': `Bearer ${process.env.FlK_PRIVATE}`
            }
        })
        console.log(data);
        const { currency, tx_ref, amount } = data.data
        if (data.status = "success" &&
            currency == ACCEPTED_CURRENCY &&
            tx_ref == expectedReference &&
            amount >= expectedAmount) {

            console.log("valid payment")
            return true
        }
        return false
    } catch (e) {
        console.log(e)
    }
}

export const createPaymentLink = async function (payload) {
    const { tx_ref, amount, email, name } = payload;
    console.log("payment started")
    const URL = 'https://api.flutterwave.com/v3/payments'
    const dataSent = {
        tx_ref,
        amount,
        currency: "NGN",
        redirect_url: "google.com",
        payment_options: "card",
        meta: {
            "consumer_id": 23,
        },
        customer: {
            email,
            name
        },
        customizations: {
            title: MERCHANT_TITLE,
            description: MERCHANT_DESCRIPTION,
            logo: MERCHANT_LOGO
        }
    }

    try {
        const { data } = await axios.post(URL, dataSent, {
            headers: {
                'Authorization': `Bearer ${process.env.FlK_PRIVATE}`
            }
        })
        const { link } = data.data
        return link
    } catch (e) {
        console.log(e.message)
    }
}



