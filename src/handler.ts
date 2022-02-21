
import { v4 as uuidv4 } from 'uuid';
import { createPaymentLink, validatePayment } from './services/flutterwave'

import depositRequest from './models/depositRequest';
import transactions from './models/transactions';
import { validateAddress } from './services/binance';


const withdrawMin = 10
const withdrawMax = 100000

const USDT_RATE = 600

interface fundRequest {
    email?: string;
    id?: number;
    fullname?: string;
    coinAddress: string;
    phone?: string;
    value: number
}

export const processWebHook = async (payload) => {
    console.log("webhook processing .....")
    const { id, amount, tx_ref } = payload
    await transactions.create({
        ...payload
    })
    const isValid = await validatePayment(id, amount, tx_ref);
    if (isValid)
        console.log("valid trasaction got in")
    else
        console.log("scam")

}



export const processCoinRequest = async (payload: fundRequest) => {

    console.log("fund request in progress")
    const { value, fullname, email } = payload;

    if (value < withdrawMin || value > withdrawMax)
        return null

    const data = {
        ...payload,
        tx_ref: uuidv4(),
        name: fullname,
        coin: 'USDT',
        network: validateAddress(payload.coinAddress),
        amount: value * USDT_RATE
    }
    await depositRequest.create({ ...data })
    return await createPaymentLink({
        ...data
    })
}
