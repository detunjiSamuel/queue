import { Router, Request, Response, NextFunction } from 'express'
import * as webhookController from '../controllers/webhook.controller'

import { checkFundWallet } from '../validator'
import * as authValidator from '../validator/auth'
import * as authContoller from '../controllers/auth.controller'

import * as cardContoller from '../controllers/card.controller'
import * as coinContoller from '../controllers/coin.controller';

import { isAuthenticated } from '../middleware'
import { handleValidation } from '../utils'

const router = Router()



router.get('/', async (req, res) => {
    res.status(200).json({ message: 'Welcome to fundwallet API v1' });
})



router.post('/user/register', authValidator.checkRegister(), handleValidation, authContoller.register);

router.post('/user/login', authValidator.checkLogin(), handleValidation, authContoller.login);
router.post('/user/logout', isAuthenticated, authContoller.logout);


router.post('/email/resendverification', authValidator.checkEmail(), handleValidation, authContoller.resendEmailVerification);
router.get('/email/verify/:token', authValidator.checkToken(), handleValidation, authContoller.verifyEmail);


// savings route first



// cards
router.post('/card', isAuthenticated, cardContoller.addCard)
router.post('/card/:tx_ref/validate', isAuthenticated, cardContoller.validateCardOtp)









router.post('/n/fund-wallet', checkFundWallet(), handleValidation, coinContoller.fundRequest)

router.post('/flutterwave-webhook', webhookController.flutterwave)


router.get('/payment-redirect', async (req, res) => {
    console.log('payment-redirect')
    const { tx_ref, transaction_id, status } = req.query
    res.send("ok")
})



export default router
