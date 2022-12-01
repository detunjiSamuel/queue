import { Request, Response, NextFunction } from 'express';
import * as cardService from '../services/card.service';

export const removeCard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user } = res.locals;
  const { id } = req.params;
  try {
    const data = await cardService.removeCard({ user, card_id: id });
    return res.status(200).json({
      status: 'success',
      message: 'Delete successful',
      data,
    });
  } catch (e) {
    next(e);
  }
};

export const chargeCard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { amount } = req.body;
  const { user } = res.locals;
  const { id } = req.params;
  try {
    const data = await cardService.chargeCard({ user, amount, id });
    return res.status(200).json({
      status: 'success',
      message: 'Card charge in  progress',
      data,
    });
  } catch (e) {
    next(e);
  }
};

export const getCard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user } = res.locals;
  try {
    const data = await cardService.getCard(user);
    return res.status(200).json({
      status: 'success',
      message: null,
      data,
    });
  } catch (e) {
    next(e);
  }
};

export const validateCardOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { otp } = req.body;
  const { tx_ref } = req.params;
  try {
    const validated = await cardService.validateCardOtp(otp, tx_ref);

    const message = validated
      ? 'Success ! ,Card processing in process'
      : 'card validation failed';

    return res.status(201).json({
      status: 'success',
      message,
      data: null,
    });
  } catch (e) {
    next(e);
  }
};

// TODO add encryption key to share private data
export const addCard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('add card', 'initiated');
  const {
    card_number,
    cvv,
    expiry_month,
    expiry_year,
    pin,
    city,
    address,
    state,
    country,
    zipcode,
  } = req.body;
  const { user } = res.locals;

  try {
    const response = await cardService.addCard({
      card_number,
      cvv,
      expiry_month,
      expiry_year,
      pin,
      user,
      city,
      address,
      state,
      country,
      zipcode,
    });
    return res.status(200).json({
      status: 'success',
      message: null,
      data: {
        ...response,
      },
    });
  } catch (e) {
    next(e);
  }
};
