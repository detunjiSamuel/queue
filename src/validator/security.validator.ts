import { body } from 'express-validator';

export const checkChangePassword = () => {
  return [
    body('old_password')
      .notEmpty()
      .withMessage('Please, provide a old_passwor'),
    body('new_password')
      .notEmpty()
      .withMessage('Please, provide a new password'),
  ];
};

export const checkVerify2fa = () => {
  return [body('token').notEmpty().withMessage('Please, provide a token')];
};
