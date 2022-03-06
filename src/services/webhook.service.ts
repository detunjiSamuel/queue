




import { validatePayment } from './flutterwave'

import transactions from '../models/transactions';



import redisClient from '../config/redis'
import AuthService from './auth.service';
import { transferCoin } from './binance';
import User from '../models/user';
import Card from '../models/card';


const { verifyToken } = new AuthService()


const cache = new redisClient()

export const processWebHook = async (payload) => {
    console.log("webhook processing .....")
    const { id, amount, tx_ref } = payload
    try {
        const internalReferenceToken = await cache.get(tx_ref)
        if (!internalReferenceToken)
            throw new Error('Reference does not match one created')
        const tokenData = await verifyToken(internalReferenceToken)
        const isValid = await validatePayment(id, tokenData.amount, tx_ref)
        if (!isValid)
            throw new Error('Invalid transaction')
        if (tokenData.action == 'ADD_CARD') {

            const user = await User.findOne({
                email: tokenData.email
            })
            if (isValid.card)
                await Card.create({
                    ...isValid.card,
                    user: user._id
                })
            const balance = user.balance + Number(amount)
            console.log('newBalance' , balance)
            await User.updateOne({ email: tokenData.email }, { balance })
            await transactions.create({ ...payload, user: user._id })
        }
        else if (tokenData.action == 'FUND_CRYPTO') {
            await transactions.create({
                ...payload
            })
            await transferCoin(tokenData.address, tokenData.amount)
        }
        return await cache.delete(tx_ref)
    } catch (e) {
        console.log(e.message)
        return null
    }
}


export const flwWebHookQueueHandler = async (job: any, done: any) => {
    try {
        console.log('flwWebHookQueue', 'handling data')
        await processWebHook({
            ...job.data
        })
        done()
    } catch (e) {
        console.log(e.message)
        done(new Error(`Flw webhook processing failed`));
    }
}



