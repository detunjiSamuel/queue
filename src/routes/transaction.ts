import { Router } from 'express';

import * as transactionContoller from '../controllers/trasactions.controller';

import { isAuthenticated } from '../middleware';

const router = Router();

// transactions
router.get('', isAuthenticated, transactionContoller.getAllTransactions);

export default router;
