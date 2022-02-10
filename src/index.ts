require('dotenv').config()
const express = require('express')
const morgan = require('morgan')


import { processCoinRequest } from "./handler"


const app = express()


app.use(morgan('dev'))
app.use(express.json());



let fakeFunding= {
    email : "itachi@akatsuki.org",
    fullname : "itachi uchiha",
    coinAddress  :"uchiha|compund",
    amount : parseFloat("33.33")
}

app.get('/fund', async (req, res) => {
    console.log("fund test")
    const link = await processCoinRequest(fakeFunding)
    return res.redirect(link)

})

app.get('/payment-redirect' , async( req, res) => {
    
})


app.post('/fund', async (req, res) => {
    console.log("test")
    const { data } = req.body
    processCoinRequest(fakeFunding)
    return res.send("ok")
})




app.listen(process.env.PORT || 5000, async () => {
    console.log('🚀 app running on port', process.env.PORT || 5000)
})
// fund
// flutterwave-hook
// request personal transaction history
// history --secret