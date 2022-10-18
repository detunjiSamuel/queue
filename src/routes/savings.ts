import { Router } from 'express';

import * as savingsController from '../controllers/savings.controller';

import * as savingsValidator from '../validator/savings.validator';

import { isAuthenticated } from '../middleware';
import { handleValidation } from '../utils';

const router = Router();

// savings
router
  .post(
    '',
    isAuthenticated,
    savingsValidator.checkCreateSavings(),
    handleValidation,
    savingsController.createSavingPlan
  )
  .put(
    '/:id',
    isAuthenticated,
    savingsValidator.checkEditSavings(),
    handleValidation,
    savingsController.editSavingPlan
  )
  .get('', isAuthenticated, savingsController.getSavingsPlan)
  .post(
    '/:id/withdraw',
    isAuthenticated,
    savingsValidator.checkSavingsWithdraw(),
    handleValidation,
    savingsController.withdrawSavingsPlan
  )
  .post(
    '/:id/fund',
    isAuthenticated,
    savingsValidator.checkFundSavings(),
    handleValidation,
    savingsController.fundSavingsPlan
  );
export default router;
