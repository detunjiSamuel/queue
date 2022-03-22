import { Router } from 'express';
import * as webhookController from '../controllers/webhook.controller';

import { checkCoinRequest } from '../validator';
import * as authValidator from '../validator/auth.validator';
import * as authContoller from '../controllers/auth.controller';

import * as cardContoller from '../controllers/card.controller';
import * as coinContoller from '../controllers/coin.controller';
import * as savingsController from '../controllers/savings.controller';
import * as savingsValidator from '../validator/savings.validator';
import * as cardValidator from '../validator/card.validator';
import { isAuthenticated } from '../middleware';
import { handleValidation } from '../utils';

const router = Router();

router.get('/', async (req, res) => {
  res.status(200).json({ message: 'Welcome to fundwallet API v1' });
});

// authentication
router.post(
  '/user/register',
  authValidator.checkRegister(),
  handleValidation,
  authContoller.register
);
router.post(
  '/user/login',
  authValidator.checkLogin(),
  handleValidation,
  authContoller.login
);
router.post('/user/logout', isAuthenticated, authContoller.logout);

// authentication Email verification
router.post(
  '/email/resendverification',
  authValidator.checkEmail(),
  handleValidation,
  authContoller.resendEmailVerification
);
router.get(
  '/email/verify/:token',
  authValidator.checkToken(),
  handleValidation,
  authContoller.verifyEmail
);

// cards
router.post('/card', isAuthenticated, cardContoller.addCard);
router.post(
  '/card/:tx_ref/validate',
  isAuthenticated,
  cardContoller.validateCardOtp
);
router.get('/card', isAuthenticated, cardContoller.getCard);
router.post(
  '/card/:id/charge',
  isAuthenticated,
  cardValidator.checkChargeCard(),
  handleValidation,
  cardContoller.chargeCard
);
router.delete('/card/:id', isAuthenticated, cardContoller.removeCard);

// savings
router.post(
  '/savings',
  isAuthenticated,
  savingsValidator.checkCreateSavings(),
  handleValidation,
  savingsController.createSavingPlan
);
router.put(
  '/savings/:id',
  isAuthenticated,
  savingsValidator.checkEditSavings(),
  handleValidation,
  savingsController.editSavingPlan
);
router.get('/savings', isAuthenticated, savingsController.getSavingsPlan);
router.post(
  '/savings/:id/withdraw',
  isAuthenticated,
  savingsValidator.checkSavingsWithdraw(),
  handleValidation,
  savingsController.withdrawSavingsPlan
);
router.post(
  '/saving/:id/fund',
  isAuthenticated,
  savingsValidator.checkFundSavings(),
  handleValidation,
  savingsController.fundSavingsPlan
);

// transactions
// get specific transaction
// get all transaction for a user
// get unauth transaction
// get all

// others ||  miscellaneous
router.post(
  '/n/fund-wallet',
  checkCoinRequest(),
  handleValidation,
  coinContoller.fundRequest
);

router.post('/flutterwave-webhook', webhookController.flutterwave);

export default router;
