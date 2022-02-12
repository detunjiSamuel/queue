
import { v4 as uuidv4 } from 'uuid';
import { createPaymentLink , validatePayment } from './services/flutterwave'


const withdrawMin =  10
const withdrawMax =  100000

export const processWebHook  = async (payload) =>{
    console.log("webhook processing .....")
    const {id , amount , tx_ref } = payload
    const isValid = await validatePayment(id , amount , tx_ref);
    if(isValid)
        console.log("valid trasaction got in")
    else
        console.log("scam")
    
}

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
    if ( amount < withdrawMin || amount > withdrawMax)
        return null
    return await createPaymentLink({
        tx_ref: uuidv4(),
        name: fullname,
        email,
        amount: amount * USDT_RATE
    })
}
