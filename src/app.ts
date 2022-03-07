import express from 'express'
import morgan from 'morgan'
import compression from 'compression'
import cors from 'cors'
import bodyParser from 'body-parser';
import helmet from 'helmet'

import router from "./routes"

const app = express()

// setup all middleware
app.use(compression());

app.use(morgan('dev'))

app.use(cors());
app.use(helmet());

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/api/v1', router);

//wildcard
app.use('*', (req, res) => {
    res.redirect('https://documenter.getpostman.com/view/10688183/UVsEUoTN')
})


export default app
