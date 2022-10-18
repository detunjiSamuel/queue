import { Request, Response, NextFunction } from 'express';
import dayjs from 'dayjs';

import Savings from '../models/savings.model';
import User from '../models/user.model';
import Card from '../models/card.model';
import HttpError from '../utils/error';

//   "amount", "frequency", "start_date", "end_date", "card"
export const createSavingPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('create savings plan');
  const { amount, frequency, start_date, end_date, card, isAutosave, user } =
    req.body;

  try {
    if (isAutosave) {
      const savings = await Savings.findOne({
        user: user.id,
        isAutosave: true,
      });
      if (savings)
        throw new HttpError(
          400,
          'Cannot have multiple plans with automatic debits'
        );
    }
    const start = dayjs(start_date);
    const end = dayjs(end_date);
    if (end.diff(start, 'month') < 2)
      throw new HttpError(400, 'Mininum of 2 months for savings');

    if (card) {
      const ownsCard = await Card.findOne({
        user: user.id,
        _id: card,
      });
      if (!ownsCard) throw new HttpError(404, 'You do not own this card');
    }

    const plan = await Savings.create({
      user: user.id,
      isAutosave,
      end_date: end.format('DD/MM/YYYY'),
      start_date: start.format('DD/MM/YYYY'),
      card,
      amount: Number(amount),
      frequency,
    });
    return res.status(201).json({
      msg: 'Plan creation successgful 👍',
      plan,
    });
  } catch (e) {
    console.log(e.message);
    next(e);
  }
};

export const editSavingPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('edit savings plan');
  try {
    const { amount, frequency, end_date, card, user, active } = req.body;
    const { id } = req.params;
    const savingsExist = await Savings.findOne({
      user: user.id,
      _id: id,
      active: true,
    });
    if (!savingsExist) throw new HttpError(401, 'cannot perform this action');
    if (card) {
      const ownsCard = await Card.findOne({
        user: user.id,
        _id: card,
      });
      if (!ownsCard)
        throw new HttpError(400, 'This Card does not belong to you');
    }
    const end = dayjs(end_date);
    const now = dayjs();
    if (end.diff(now, 'month') < 2)
      throw new HttpError(400, 'Mininum of 2 months for savings');
    await Savings.updateOne(
      {
        _id: savingsExist.id,
      },
      {
        amount,
        frequency,
        end_date,
        card,
        user: user.id,
      }
    );
    return res.status(200).json({
      msg: 'Edit successfull',
    });
  } catch (e) {
    console.log(e.message);
    next(e);
  }
};

export const getSavingsPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user } = req.body;
  try {
    const savings = await Savings.find({
      user: user.id,
    });
    if (savings)
      return res.status(200).json({
        savings,
      });
    throw new HttpError(404, 'No savings is attached to this user');
  } catch (e) {
    next(e);
  }
};

export const withdrawSavingsPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = req.body;
    const { id } = req.params;
    const savingsExist = await Savings.findOne({
      user: user.id,
      _id: id,
      active: true,
    });
    if (!savingsExist) throw new HttpError(401, 'cannot perform this action');

    const amount = savingsExist.invested;
    const activeuser = await User.findById(user.id);
    // @ts-ignore
    const newBalance: Number = activeuser.balance + amount;

    await Savings.updateOne(
      {
        _id: id,
      },
      { active: false, invested: 0 }
    );
    await User.updateOne(
      {
        _id: user.id,
      },
      {
        balance: newBalance,
      }
    );

    return res.status(200).json({
      msg: 'savings Withdrawal successful',
    });
  } catch (e) {
    next(e);
  }
};
// move user balance to fund  a savings plan
export const fundSavingsPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user, amount } = req.body;
    const { id } = req.params;
    const savingsExist = await Savings.findOne({
      user: user.id,
      _id: id,
      active: true,
    });
    if (!savingsExist) throw new HttpError(401, 'cannot perform this action');

    const activeuser = await User.findById(user.id);
    if (amount > activeuser.balance)
      throw new HttpError(401, 'cannot perform this action, you are broke');

    const newBalance = activeuser.balance - amount;
    await User.updateOne({ _id: user.id }, { balance: newBalance });
    await Savings.updateOne(
      { _id: id },
      { invested: amount + savingsExist.invested }
    );
    return res.status(200).json({
      msg: 'Transafer from wallet to plan complete',
    });
  } catch (e) {
    console.log(e.meessage);
    next(e);
  }
};
