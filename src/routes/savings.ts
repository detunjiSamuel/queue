import { Router } from 'express';

import * as savingsController from '../controllers/savings.controller';

import * as savingsValidator from '../validator/savings.validator';

import { isAuthenticated } from '../middleware';
import { handleValidation } from '../utils';

const router = Router();

router.use(isAuthenticated);

// savings
router
  .route('')
  .post(
    savingsValidator.checkCreateSavings(),
    handleValidation,
    savingsController.createSavingPlan
  )
  .get(savingsController.getSavingsPlan);

router
  .put(
    '/:id',
    savingsValidator.checkEditSavings(),
    handleValidation,
    savingsController.editSavingPlan
  )

  .post(
    '/:id/withdraw',
    savingsValidator.checkSavingsWithdraw(),
    handleValidation,
    savingsController.withdrawSavingsPlan
  )
  .post(
    '/:id/fund',
    savingsValidator.checkFundSavings(),
    handleValidation,
    savingsController.fundSavingsPlan
  );
export default router;
