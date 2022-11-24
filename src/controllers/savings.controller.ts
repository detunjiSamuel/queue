import { Request, Response, NextFunction } from 'express';
import dayjs from 'dayjs';

import Savings from '../models/savings.model';
import User from '../models/user.model';
import Card from '../models/card.model';
import HttpError from '../utils/error';

import * as savingsService from '../services/savings.service';

//   "amount", "frequency", "start_date", "end_date", "card"
export const createSavingPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('create savings plan');
  const { user } = res.locals;
  const { amount, frequency, start_date, end_date, card, isAutosave } =
    req.body;

  try {
    const plan = await savingsService.createSavingPlan({
      user,
      amount,
      frequency,
      start_date,
      end_date,
      card,
      isAutosave,
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
    const { user } = res.locals;
    const { amount, frequency, end_date, card, active } = req.body;
    const { id } = req.params;

    await savingsService.editSavingPlan({
      amount,
      frequency,
      end_date,
      card,
      active,
      id,
      user,
    });
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
  const { user } = res.locals;
  try {
    const savings = await savingsService.getSavingsPlan({ user });
    return res.status(200).json({
      status: 'success',
      data: savings,
    });
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

    await savingsService.withdrawSavingsPlan({ user, id });

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
    const { user } = res.locals;
    const { amount } = req.body;
    const { id } = req.params;
    await savingsService.fundSavingsPlan({
      user,
      amount,
      id,
    });
    return res.status(200).json({
      msg: 'Transafer from wallet to plan complete',
    });
  } catch (e) {
    console.log(e.meessage);
    next(e);
  }
};
