import { Router } from 'express';

import * as authValidator from '../validator/auth.validator';
import * as authContoller from '../controllers/auth.controller';

import { handleValidation } from '../utils';

const router = Router();

// authentication Email verification
router
  .post(
    '/resendverification',
    authValidator.checkEmail(),
    handleValidation,
    authContoller.resendEmailVerification
  )
  .get(
    '/verify/:token',
    authValidator.checkToken(),
    handleValidation,
    authContoller.verifyEmail
  );

export default router;
