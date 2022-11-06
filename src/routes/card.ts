import { Router } from 'express';

import * as cardContoller from '../controllers/card.controller';

import * as cardValidator from '../validator/card.validator';
import { isAuthenticated } from '../middleware';
import { handleValidation } from '../utils';

const router = Router();

router.use(isAuthenticated);

// cards
router
  .post('', cardContoller.addCard)
  .post('/:tx_ref/validate', cardContoller.validateCardOtp)
  .get('', cardContoller.getCard)
  .post(
    '/:id/charge',

    cardValidator.checkChargeCard(),
    handleValidation,
    cardContoller.chargeCard
  )
  .delete('/:id', cardContoller.removeCard);

export default router;
