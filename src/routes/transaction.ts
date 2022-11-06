import { Router } from 'express';

import * as transactionContoller from '../controllers/trasactions.controller';

import { isAuthenticated } from '../middleware';

const router = Router();

router.use(isAuthenticated);

// transactions
router.get('', transactionContoller.getAllTransactions);

export default router;
