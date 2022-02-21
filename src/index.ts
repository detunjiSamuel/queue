require('dotenv').config()
import * as express from 'express'
import * as morgan from 'morgan'
import * as mongoose from 'mongoose'

import router from "./routes"
import depositRequest from './models/depositRequest'
import transactions from './models/transactions'

//for testing
import { getCoinInfo, getUserInfo, validateAddress } from './services/binance'
const app = express()


app.use(morgan('dev'))
app.use(express.json());





app.use('/api/v1', router);



mongoose.connect(process.env.MONGODB_URL, async () => {
    console.log("db started")


  console.log(await transactions.find())
})

app.listen(process.env.PORT || 5000, async () => {
    console.log('🚀 app running on port', process.env.PORT || 5000)

})
// fund
// flutterwave-hook
// request personal transaction history
// history --secret