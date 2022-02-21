
import { Router } from 'express'
import { processWebHook, processCoinRequest } from '../handler';
import { fakeFunding } from '../mocks';


const router = Router()

router.get('/', async (req, res) => {
    res.status(200).json({ message: 'Welcome to fundwallet API v1' });
})

router.get('/payment-redirect', async (req, res) => {
    console.log('payment-redirect')
    const { tx_ref, transaction_id, status } = req.query
    res.send("ok")
})

router.get('/fund', async (req, res) => {
    console.log("fund test")
    const link = await processCoinRequest(fakeFunding)
    res.redirect(link)

})

router.post('/fund', async (req, res) => {
    console.log("test")
    const { data } = req.body
    processCoinRequest(fakeFunding)
    return res.send("ok")
})

router.post('/flutterwave-webhook', async (req, res) => {
    console.log("flutterwave dialup")
    const hash = req.headers["verif-hash"]
    const secret_hash = process.env.FLK_HASH
    if (!hash || hash == secret_hash)
        return res.end()
    const { data } = req.body
    processWebHook(data) // don't wait intentional
    res.end()

})



export default router
