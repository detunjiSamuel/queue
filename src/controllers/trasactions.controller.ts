import { Request, Response, NextFunction } from 'express';
import Transaction from '../models/transaction.model';
import HttpError from '../utils/error';

export const getAllTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('transactions', 'get all user');
  const { user } = req.body;
  try {
    const transactions = await Transaction.find({
      user: user.id,
    });
    if (transactions)
      return res.status(200).json({
        transactions,
      });
    throw new HttpError(404, 'No transactions');
  } catch (e) {
    console.log(e.meessage);
    next(e);
  }
};
