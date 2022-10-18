import { Router } from 'express';

import * as cardContoller from '../controllers/card.controller';

import * as cardValidator from '../validator/card.validator';
import { isAuthenticated } from '../middleware';
import { handleValidation } from '../utils';

const router = Router();

// cards
router
  .post('', isAuthenticated, cardContoller.addCard)
  .post('/:tx_ref/validate', isAuthenticated, cardContoller.validateCardOtp)
  .get('', isAuthenticated, cardContoller.getCard)
  .post(
    '/:id/charge',
    isAuthenticated,
    cardValidator.checkChargeCard(),
    handleValidation,
    cardContoller.chargeCard
  )
  .delete('/:id', isAuthenticated, cardContoller.removeCard);

export default router;
