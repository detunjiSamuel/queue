import * as coinService from '../services/coin.service';
import { Request, Response, NextFunction } from 'express';

export const fundRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, fullname, coinAddress, value } = req.body;

    const data = await coinService.processCoinRequest({
      email,
      fullname,
      coinAddress,
      value,
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
