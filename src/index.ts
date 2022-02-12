require('dotenv').config()
const express = require('express')
const morgan = require('morgan')


import { processCoinRequest  , processWebHook } from "./handler"

//for testing
import { getCoinInfo, getUserInfo , validateAddress  } from './services/binance'

const app = express()


app.use(morgan('dev'))
app.use(express.json());



let fakeFunding = {
    email: "itachi@akatsuki.org",
    fullname: "itachi uchiha",
    coinAddress: "uchiha|compund",
    amount: parseFloat("33.33")
}

const testAddress = {
    TRC20: 'TD6ex3gsRfpdM51dVm5Co21dLCVURa8HUG',
    BSC: '0x67598b2a530826063eeffd482f1765892dba25eb',
    random: 'fdgdgdgd'
}


function testAddresses () {
    for(let address in testAddress)
    {
        const value  =  testAddress[address]
        console.log( `${value} :  ${validateAddress(value)}`)
    }
}


app.get('/test' ,async (req, res) => {
    const send =  await getCoinInfo()
    res.send(send)
})
app.get('/usercoin' ,async (req, res) => {
    const send =  await getCoinInfo()
    res.send(send)
})

app.get('/fund', async (req, res) => {
    console.log("fund test")
    const link = await processCoinRequest(fakeFunding)
    res.redirect(link)

})

app.post('/flutterwave-webhook', async (req, res) => {
    console.log("flutterwave dialup")
    const hash = req.headers["verif-hash"]
    const secret_hash = process.env.FLK_HASH
    if (!hash || hash == secret_hash)
        res.end()
    const { data } = req.body
    processWebHook(data) // don't wait intentional
    res.end()

})



app.get('/payment-redirect', async (req, res) => {
    console.log('payment-redirect')
    const { tx_ref, transaction_id, status } = req.query
    res.send("ok")
})

app.post('/payment-redirect', async (req, res) => {
    console.log('post hit payment-redirect')

})



app.post('/fund', async (req, res) => {
    console.log("test")
    const { data } = req.body
    processCoinRequest(fakeFunding)
    return res.send("ok")
})




app.listen(process.env.PORT || 5000, async () => {
    console.log('🚀 app running on port', process.env.PORT || 5000)
    testAddresses()

})
// fund
// flutterwave-hook
// request personal transaction history
// history --secret