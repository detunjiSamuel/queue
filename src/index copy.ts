require('dotenv').config()
const express = require('express')
import { Telegraf } from 'telegraf'
import {createPaymentLink} from './services/flutterwave'
import paymentWebhook from './services/webhook'
import transferCoin from './services/binance'

const app = express()

app.use(express.json());

const init = async (app) => {

    // initailize telegram
    const token = process.env.BOT_TOKEN
    if (token === undefined) {
        throw new Error('BOT_TOKEN must be provided!')
    }
    const bot = new Telegraf(token)
    app.use(bot.webhookCallback('/telegram'))
    bot.telegram.setWebhook(`${process.env.SERVER_URL}/telegram`)

}
app.get('/', async (req, res) => {
    res.send('Hey there')
    await transferCoin()

})

app.get('/test', async (req, res) => {
    console.log("received convenient link")
    const send = await createPaymentLink()
    return send

})

app.post('/flutterwave-webhook', async (req, res) => {
    console.log("flutterwave dialup")
    const hash = req.headers["verif-hash"]
    const secret_hash = process.env.FLK_HASH
    if (!hash || hash== secret_hash)
        res.end()
    const { data } = req.body
    await paymentWebhook(data)
    res.end()
})

//bot.telegram.sendMessage('849483811', `history :`)


app.listen(process.env.PORT || 5000, async () => {
    console.log('🚀 app running on port', process.env.PORT || 5000)
})