import axios from 'axios'
import config from '../config'
import Flutterwave from 'flutterwave-node-v3'
const { flutterwave, merchant } = config

const ACCEPTED_CURRENCY = "NGN"

const flw = new Flutterwave(flutterwave.public, flutterwave.private);

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
            // Ensure transaction received is  expected
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



export const chargeBulk = async (title, data) => {
    try {
        const payload = {
            title,
            bulk_data: data,
            retry_strategy: {
                retry_interval: 120,
                retry_amount_variable: 100,
                retry_attempt_variable: 2
            }
        }
        const response = await flw.Tokenized.bulk(payload)
        return null
    } catch (e) {
        console.error('charge_bult err:', e.meessage)
        throw new Error('charge_bulk failure')
    }
}


export const chargeWithToken = async (payload) => {
    try {
        const response = await flw.Tokenized.charge(payload)
    } catch (e) {
        console.error('charge with token failed', e.meessage)
    }
}