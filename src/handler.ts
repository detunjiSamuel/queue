
import { v4 as uuidv4 } from 'uuid';
import { createPaymentLink } from './services/flutterwave'

interface fundRequest {
    email?: string;
    id?: number;
    fullname?: string;
    coinAddress: string;
    phone?: string;
    amount: number
}

const USDT_RATE = 600


export const processCoinRequest = async (payload: fundRequest) => {
    console.log("fund request in progress")
    const { amount, fullname, email } = payload;

    return await createPaymentLink({
        tx_ref: uuidv4(),
        name: fullname,
        email,
        amount: amount * USDT_RATE
    })
}
