import { Request, Response } from 'express'
import { nanoid } from 'nanoid'
import Flutterwave from 'flutterwave-node-v3'
import AuthService from '../services/auth.service'

import redisClient from '../config/redis'

import config from '../config/index'

const { flutterwave } = config

const flw = new Flutterwave(flutterwave.public, flutterwave.private);
const cache = new redisClient()
const { createToken, verifyToken } = new AuthService()

//TODO add encryption key to share private data 
export const addCard = async (req: Request, res: Response) => {
    console.log('add card', 'initiated')
    const { card_number, cvv, expiry_month, expiry_year, user, pin } = req.body
    const payload = generatePayload({
        card_number,
        cvv,
        expiry_month,
        expiry_year,
        ...user,
        pin
    })
    try {
        const response = await flw.Charge.card(payload)
        console.log(response)
        if (response.status == 'error' || response.status.includes('fail'))
            throw new Error('This card cannot be accepted')

        const directive = response.meta.authorization.mode

        const internalReferenceToken = await createToken({
            tx_ref: payload.tx_ref,
            flw_ref: response.data.flw_ref,
            email: payload.email,
            amount: payload.amount,
            action: 'ADD_CARD'
        })
        await cache.add(payload.tx_ref, internalReferenceToken)
        // authorize card transaction
        if (directive == 'redirect') {
            const link = response.meta.authorization.redirect
            return res.status(200).json({
                msg: 'Complete add action with link',
                link,
                action: 'redirect',
            })
        }
        else if ((directive == 'pin') || (directive == 'avs_noauth')) {
            return res.status(200).json({
                msg: `missing field to authorize`,
                "fields": response.meta.authorization.fields,
                tx_ref: payload.tx_ref,
                route: '/card'
            })
        }
        else if (directive == 'otp') {
            payload.flw_ref = response.data.flw_ref
            const payloadToken = await createToken({ ...payload, action: 'OTP_VALIDATION' })
            //check exists then override
            console.log('tx_ref:', payload.tx_ref)
            await cache.add(`opt-${payload.tx_ref}`, payloadToken)
            return res.status(200).json({
                msg: response.data.processor_response,
                "fields": [
                    "pin"
                ],
                route: `/card/${payload.tx_ref}/validate`
            })
        } else {
            return res.status(200).json({
                msg: "Card processing in progress"
            })
        }

    } catch (e) {
        console.log(e.message)
        return res.status(500).json({ msg: 'failed to add card', route: "/card" })

    }

}

export const validateCardOtp = async (req: Request, res: Response) => {
    const { otp } = req.body
    const { tx_ref } = req.params
    const paymentToken = await cache.get(`opt-${tx_ref}`)
    if (!paymentToken)
        return res.status(401).json('Invalid payment reference passed');
    const tokenData = await verifyToken(paymentToken)
    try {
        const validate = await flw.Charge.validate({
            otp,
            flw_ref: tokenData.flw_ref
        })
        await cache.delete(`opt-${tx_ref}`)
        if (validate.message == 'Charge validated')
            return res.status(201).json({ msg: 'Success ! ,Card processing in process' })
    } catch (e) {
        console.log(e.message)
        return res.status(500).json({ msg: 'failed to add card', route: "/card" })

    }
}



function generatePayload(data) {
    if (data.pin)
        data.authorization = {
            "mode": "pin",
            "fields": [
                "pin"
            ],
            "pin": data.pin
        }
    //remove excess from db
    delete data.iat;
    delete data.exp;
    delete data.id;
    data.tx_ref = `add_${nanoid()}`
    data.fullname = data.first_name + ' ' + data.last_name
    return {
        ...data,
        redirect_url: "https://www.google.com",
        enckey: flutterwave.encrypt,
        phone_number: "0902620185",
        currency: "NGN",
        amount: "100",
    }
}


// const chargeCard = async () => {
//     try {
//         const payload = ''
//         const response = await flw.Charge.card(payload)
//         console.log(response)
//         // check for if status is not success || error
//         if (response.meta.authorization.mode === 'pin') {
//             let payload2 = payload
//             payload2.authorization = {
//                 "mode": "pin",
//                 "fields": [
//                     "pin"
//                 ],
//                 "pin": 3310
//             }
//             const reCallCharge = await flw.Charge.card(payload2)
//             console.log(reCallCharge)

//             const callValidate = await flw.Charge.validate({
//                 "otp": "12345",
//                 "flw_ref": reCallCharge.data.flw_ref
//             })
//             console.log(callValidate)

//         }
//         if (response.meta.authorization.mode === 'redirect') {

//             var url = response.meta.authorization.redirect
//             open(url)
//         }

//         console.log(response)


//     } catch (error) {
//         console.log(error)
//     }
// }
