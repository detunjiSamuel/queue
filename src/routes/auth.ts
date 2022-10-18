import { Router } from 'express';

import * as authValidator from '../validator/auth.validator';
import * as authContoller from '../controllers/auth.controller';

import { isAuthenticated } from '../middleware';
import { handleValidation } from '../utils';

const router = Router();

// authentication
router
  .post(
    '/register',
    authValidator.checkRegister(),
    handleValidation,
    authContoller.register
  )
  .post(
    '/login',
    authValidator.checkLogin(),
    handleValidation,
    authContoller.login
  )
  .post('/logout', isAuthenticated, authContoller.logout);

export default router;
