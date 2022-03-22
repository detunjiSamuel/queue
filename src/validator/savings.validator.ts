import { body, param } from 'express-validator';

const ALL_FREQUENCY = ['daily', 'weekly', 'monthly'];

export const checkCreateSavings = () => {
  return [
    body('amount')
      .notEmpty()
      .isNumeric()
      .withMessage('Please, provide a valid amount')
      .custom(customAmount)
      .withMessage('amount must be grater than 1000'),
    body('start_date')
      .isDate()
      .withMessage('Please, provide a valid date  in format YYYY/MM/DD')
      .custom(customStart)
      .withMessage('start_date cannot be less than today'),
    body('end_date')
      .isDate()
      .withMessage('Please, provide a valid date in formar YYYY/MM/DD'),
    body('frequency')
      .custom(customFreqCheck)
      .withMessage(`Frequency can only be :${ALL_FREQUENCY.toString()} `),
  ];
};

export const checkEditSavings = () => {
  return [
    param('id').notEmpty().withMessage('savings ID required'),
    body('amount').isNumeric().withMessage('Please, provide a valid amount'),
    body('end_date')
      .isDate()
      .withMessage('Please, provide a valid date in formar YYYY/MM/DD')
      .custom(customStart)
      .withMessage('end_date cannot be less than today'),
    body('frequency')
      .custom(customFreqCheck)
      .withMessage(`Frequency can only be :${ALL_FREQUENCY.toString()} `),
  ];
};

export const checkSavingsWithdraw = () => {
  return [param('id').notEmpty().withMessage('savigns plan id require')];
};

export const checkFundSavings = () => {
  return [
    param('id').notEmpty().withMessage('savigns plan id require'),
    body('amount').isNumeric().withMessage('Please, provide a valid amount'),
  ];
};

const customStart = (value) => {
  if (new Date(value) > new Date()) return true;
  return false;
};

const customFreqCheck = (value) => {
  if (ALL_FREQUENCY.includes(value)) return true;
  return false;
};

const customAmount = (value) => {
  if (value > 5000) return true;
  return false;
};
