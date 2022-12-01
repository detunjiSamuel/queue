import { Router } from 'express';
import { isAuthenticated } from '../middleware';

import * as securityContoller from '../controllers/security.contoller';

import { handleValidation } from '../utils';
import * as secuityValidator from '../validator/security.validator';

const router = Router();

router.use(isAuthenticated);
router
  .route('/2fa')
  .post(securityContoller.setUpTwoFactor)
  .get(securityContoller.getTwoFactor)
  .delete(securityContoller.removeTwoFactor);

router
  .route('/2fa/verify')
  .post(
    secuityValidator.checkVerify2fa(),
    handleValidation,
    securityContoller.verifyTwoFactor
  );

router.post(
  '/change-password',
  secuityValidator.checkChangePassword(),
  handleValidation,
  securityContoller.changePassword
);

export default router;
