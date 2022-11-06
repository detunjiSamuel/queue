import { Request, Response, NextFunction } from 'express';
import { nanoid } from 'nanoid';
import Flutterwave from 'flutterwave-node-v3';
import { createToken } from '../services/auth.service';

import RedisClient from '../config/redis';
import * as Service from '../services/card.service';
import config from '../config/index';
import HttpError from '../utils/error';

import * as helper from '../helpers/card';

const { flutterwave } = config;

const flw = new Flutterwave(flutterwave.public, flutterwave.private);
const cache = new RedisClient();

export const removeCard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user } = res.locals;
  const { id } = req.params;
  try {
    await Service.removeCard(user, id);
    return res.status(200).json({
      msg: 'Delete successful',
    });
  } catch (e) {
    console.log(e.message);
    next(e);
  }
};

export const chargeCard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { amount, user } = req.body;
  const { id } = req.params;
  try {
    await Service.chargeCard(user, amount, id);
    return res.status(200).json({
      msg: 'Card charge in  progress',
    });
  } catch (e) {
    console.log(e.message);
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
    const cards = await Service.getCard(user);
    return res.status(200).json({
      cards,
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
    const validated = await Service.validateCardOtp(otp, tx_ref);
    if (validated)
      return res
        .status(201)
        .json({ msg: 'Success ! ,Card processing in process' });
  } catch (e) {
    console.log(e.message);
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
  const { card_number, cvv, expiry_month, expiry_year, pin } = req.body;
  const { user } = res.locals;

  try {
    const response = await Service.addCard({
      card_number,
      cvv,
      expiry_month,
      expiry_year,
      pin,
      user,
    });
    return res.status(200).json({
      ...response,
    });
  } catch (e) {
    console.log(e.message);
    next(e);
  }
};
