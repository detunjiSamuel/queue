import express from 'express';
import morgan from 'morgan';
import compression from 'compression';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';

import {
  authRoute,
  cardRoute,
  emailRoute,
  miscRoute,
  savingsRoute,
  transactionRoute,
} from './routes';
import handleError from './middleware/error';
import registerQueues from './start/queues';

const app = express();

registerQueues();

// setup all middleware
app.use(compression());

app.use(morgan('dev'));

app.use(cors());
app.use(helmet());

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/v1/user', authRoute);
app.use('/api/v1/savings', savingsRoute);
app.use('/api/v1/card', cardRoute);
app.use('/api/v1/transactions', transactionRoute);
app.use('/api/v1/email', emailRoute);
app.use('/api/v1', miscRoute);

app.use(handleError);

// wildcard
app.use('*', (req, res) => {
  res.redirect('https://documenter.getpostman.com/view/10688183/UVsEUoTN');
});

export default app;
