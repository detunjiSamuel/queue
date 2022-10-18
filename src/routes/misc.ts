import { Router } from 'express';
import * as webhookController from '../controllers/webhook.controller';

import { checkCoinRequest } from '../validator';

import * as coinContoller from '../controllers/coin.controller';

import { handleValidation } from '../utils';

const router = Router();

router.get('/', async (req, res) => {
  res.status(200).json({ message: 'Welcome to fundwallet API v1' });
});

// others ||  miscellaneous
router.post(
  '/n/fund-wallet',
  checkCoinRequest(),
  handleValidation,
  coinContoller.fundRequest
);

// webhook
router.post('/flutterwave-webhook', webhookController.flutterwave);

export default router;
