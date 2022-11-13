import { body, param } from 'express-validator';

export const checkChargeCard = () => {
  return [
    body('amount')
      .notEmpty()
      .isNumeric()
      .withMessage('Please, provide a valid amount')
      .custom(customAmount)
      .withMessage('amount must be grater than 1000'),
    param('id').notEmpty().withMessage('id of card must be included'),
  ];
};

export const checkRemoveCard = () => {
  return [param('id').notEmpty().withMessage('id of card is required')];
};

const customAmount = (value) => {
  if (value > 1000) return true;
  return false;
};

export const checkAddCard = () => {
  return [
    body('card_number').notEmpty(),
    body('cvv').notEmpty(),
    body('expiry_month').notEmpty(),
    body('expiry_year').notEmpty(),
  ];
};

export const checkValidateCard = () => {
  return [body('otp').notEmpty()];
};
