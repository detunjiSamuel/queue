import { Router } from 'express';

import * as cardContoller from '../controllers/card.controller';

import * as cardValidator from '../validator/card.validator';
import { isAuthenticated } from '../middleware';
import { handleValidation } from '../utils';

const router = Router();

router.use(isAuthenticated);

router
  .route('')
  .post(cardValidator.checkAddCard(), handleValidation, cardContoller.addCard)
  .get(cardContoller.getCard);
// cards
router
  .post(
    '/:tx_ref/validate',
    cardValidator.checkValidateCard(),
    handleValidation,
    cardContoller.validateCardOtp
  )
  .post(
    '/:id/charge',

    cardValidator.checkChargeCard(),
    handleValidation,
    cardContoller.chargeCard
  )
  .delete('/:id', cardContoller.removeCard);

export default router;
