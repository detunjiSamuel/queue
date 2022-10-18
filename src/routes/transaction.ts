import { Router } from 'express';
import * as webhookController from '../controllers/webhook.controller';

import { checkCoinRequest } from '../validator';
import * as authValidator from '../validator/auth.validator';
import * as authContoller from '../controllers/auth.controller';

import * as cardContoller from '../controllers/card.controller';
import * as coinContoller from '../controllers/coin.controller';
import * as savingsController from '../controllers/savings.controller';
import * as transactionContoller from '../controllers/trasactions.controller';
import * as savingsValidator from '../validator/savings.validator';
import * as cardValidator from '../validator/card.validator';
import { isAuthenticated } from '../middleware';
import { handleValidation } from '../utils';

const router = Router();

// transactions
router.get('', isAuthenticated, transactionContoller.getAllTransactions);

export default router;
