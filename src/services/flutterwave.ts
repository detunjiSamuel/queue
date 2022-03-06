import axios from 'axios'
import config from '../config'
const { flutterwave, merchant } = config

const ACCEPTED_CURRENCY = "NGN"


export const validatePayment = async (transactionId, expectedAmount, expectedReference) => {
    console.log("validation began")
    const URL = `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`
    try {
        const { data } = await axios.get(URL, {
            headers: {
                'Authorization': `Bearer ${flutterwave.private}`
            }
        })
        if (data) {
            const { currency, tx_ref, amount, card } = data.data
            if (data.status = "success" &&
                currency == ACCEPTED_CURRENCY &&
                tx_ref == expectedReference &&
                amount >= expectedAmount) {
                console.log("valid payment")
                return {
                    isValid: true,
                    card
                }
            }
        }
        return false
    } catch (e) {
        console.log(e.message)
        return false
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
            title: merchant.title,
            description: merchant.description,
            logo: merchant.logo
        }
    }
    try {
        const { data } = await axios.post(URL, dataSent, {
            headers: {
                'Authorization': `Bearer ${flutterwave.private}`
            }
        })
        const { link } = data.data
        return link
    } catch (e) {
        console.log(e.message)
    }
}
