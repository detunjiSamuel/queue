import { Request, Response, NextFunction } from 'express';

import * as savingsService from '../services/savings.service';

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
    const data = await savingsService.createSavingPlan({
      user,
      amount,
      frequency,
      start_date,
      end_date,
      card,
      isAutosave,
    });
    return res.status(201).json({
      status: 'success',
      message: 'Plan creation successgful 👍',
      data,
    });
  } catch (e) {
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

    const data = await savingsService.editSavingPlan({
      amount,
      frequency,
      end_date,
      card,
      active,
      id,
      user,
    });
    return res.status(200).json({
      status: 'success',
      message: 'Edit successful 👍',
      data,
    });
  } catch (e) {
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
      message: null,
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

    const data = await savingsService.withdrawSavingsPlan({ user, id });

    return res.status(200).json({
      status: 'success',
      message: 'savings Withdrawal successful',
      data,
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
    const data = await savingsService.fundSavingsPlan({
      user,
      amount,
      id,
    });
    return res.status(200).json({
      status: 'success',
      message: 'Transfer from wallet to plan complete',
      data,
    });
  } catch (e) {
    next(e);
  }
};
