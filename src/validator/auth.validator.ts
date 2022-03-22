import { body, param } from 'express-validator';

export const checkRegister = () => {
  return [
    body('first_name').notEmpty().withMessage('Please, provide a first name'),
    body('last_name').notEmpty().withMessage('Please, provide a last name'),
    body('email')
      .notEmpty()
      .isEmail()
      .withMessage('Please, provide a valid email'),
    body('username')
      .notEmpty()
      .withMessage('Please, provide a username')
      .isLength({ min: 5 })
      .withMessage('Username must have at least 5 characters'),
    body('password')
      .notEmpty()
      .withMessage('Please, provide a password')
      .isLength({ min: 6 })
      .withMessage('Password must have at least 6 characters'),
  ];
};

export const checkLogin = () => {
  return [
    body('email')
      .notEmpty()
      .isEmail()
      .withMessage('Please, provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Please, provide a password')
      .isLength({ min: 6 })
      .withMessage('Password must have at least 6 characters'),
  ];
};

export const checkToken = () => {
  return [
    param('token').notEmpty().withMessage('Please, provide a valid link'),
  ];
};

export const checkEmail = () => {
  return [
    body('email')
      .notEmpty()
      .isEmail()
      .withMessage('Please, provide a valid email'),
  ];
};

export const checkPassword = () => {
  return [
    body('password')
      .notEmpty()
      .withMessage('Please, provide a new password')
      .isLength({ min: 6 })
      .withMessage('Password must have at least 6 characters'),
  ];
};
