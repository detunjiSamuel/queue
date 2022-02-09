import axios from 'axios'
import { v4 as uuidv4 } from 'uuid';


interface User {
    name: string;
    id: number;
}


const createPaymentLink = async function (/*user: User,*/)  {
    console.log("payment started")
    const tx_ref =  uuidv4();
    const URL = 'https://api.flutterwave.com/v3/payments'
    const dataSent = {
        tx_ref,
        "amount":"100",
        "currency":"NGN",
       "redirect_url":"https://webhook.site/e8e9a64a-f227-4c8b-9b17-81b4a1534bc7",
        "payment_options":"card",
        "meta":{
           "consumer_id":23,
           "consumer_mac":"92a3-912ba-1192a"
        },
        "customer":{
           "email":"user@gmail.com",
           "phonenumber":"080****4528",
           "name":"Yemi Desola"
        },
        "customizations":{
           "title":"Pied Piper Payments",
           "description":"Middleout isn't free. Pay the price",
           "logo":"https://assets.piedpiper.com/logo.png"
        }
     }

    try {
        const { data } = await axios.post(URL, dataSent, {
            headers: {
                'Authorization': `Bearer ${process.env.FlK_PRIVATE}`
            }
        })
        console.log(data)
        return data
    } catch (e) {
        console.log(e.message)
    }
}

export default createPaymentLink