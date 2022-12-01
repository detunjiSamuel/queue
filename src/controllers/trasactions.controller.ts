import { Request, Response, NextFunction } from 'express';

import * as trasactionService from '../services/transactions.service';

export const getAllTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('transactions', 'get all user');
  const { user } = res.locals;
  try {
    const data = trasactionService.getTransactions({
      user_id: user.id,
    });

    return res.status(200).json({
      status: 'success',
      message: null,
      data,
    });
  } catch (e) {
    next(e);
  }
};
