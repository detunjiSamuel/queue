import { Request, Response, NextFunction } from 'express'
import { nanoid } from 'nanoid'
import Flutterwave from 'flutterwave-node-v3'
import AuthService from '../services/auth.service'

import redisClient from '../config/redis'
import Card from '../models/card.model'

import config from '../config/index'
import { chargeQueue } from '../config/bull'
import httpError from '../utils/error'

const { flutterwave } = config


const flw = new Flutterwave(flutterwave.public, flutterwave.private);
const cache = new redisClient()
const { createToken, verifyToken } = new AuthService()


//TODO add encryption key to share private data 
export const addCard = async (req: Request, res: Response, next: NextFunction) => {
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
        if (response.status == 'error' || response.status.includes('fail'))
            throw new httpError(401, 'This card cannot be accepted')

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
        next(e)

    }

}

export const removeCard = async (req: Request, res: Response, next: NextFunction) => {

    const { user } = req.body
    const { id } = req.params
    try {
        const ownsCard = await Card.findOne({
            user: user.id,
            _id: id
        })
        if (!ownsCard)
            throw new httpError(400, 'This Card does not belong to you')

        await Card.deleteOne({
            _id: id
        })
        return res.status(200).json({
            msg: "Delete successful"
        })

    } catch (e) {
        console.log(e.message)
        next(e)
    }
}

export const chargeCard = async (req: Request, res: Response, next: NextFunction) => {
    const { amount, user } = req.body
    const { id } = req.params
    try {
        const ownsCard = await Card.findOne({
            user: user.id,
            _id: id
        })
        if (!ownsCard)
            throw new httpError(404, 'This Card does not belong to you')
        const tx_ref = `charge_${nanoid()}`
        const payload = {
            tx_ref,
            email: user.email,
            amount,
            action: 'CHARGE_CARD'
        }
        const internalReferenceToken = await createToken(payload)
        await cache.add(tx_ref, internalReferenceToken)
        await chargeQueue.add({
            payload: {
                ...payload,
                first_name: user.first_name,
                last_name: user.last_name,
                narration: 'CHARGE_CARD',
                redirect_url: "https://www.google.com",
                currency: "NGN",
                country: "NG",
                token: ownsCard.token
            }
        })
        return res.status(200).json({
            msg: "Card charge in  progress"
        })
    }
    catch (e) {
        console.log(e.message)
        next(e)
    }
}


export const getCard = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req.body
    try {
        const cards = await Card.find({
            user: user.id
        })
        if (cards)
            return res.status(200).json({
                cards
            })
        throw new httpError(404, "No card is attached to this user")


    } catch (e) {
        next(e)
    }
}

export const validateCardOtp = async (req: Request, res: Response, next: NextFunction) => {
    const { otp } = req.body
    const { tx_ref } = req.params
    const paymentToken = await cache.get(`opt-${tx_ref}`)
    if (!paymentToken)
        throw new httpError(401, 'Invalid payment reference passed')
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
        next(e)

    }
}



function generatePayload(data: any) {
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
        phone_number: "0902620185",// i dont collect numbers so will use this one
        currency: "NGN",
        amount: "100",
    }
}


