import { Request, Response, NextFunction } from 'express';
import * as twoFactorService from '../services/2fA.service';
import * as authService from '../services/auth.service';

export const setUpTwoFactor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = res.locals;

    const data = await twoFactorService.setupAuthenticator({
      user_id: user.id,
    });
    return res.status(200).json({
      status: 'success',
      message: 'verify two-factor to activate',
      data,
    });
  } catch (e) {
    next(e);
  }
};

export const getTwoFactor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = res.locals;

    const data = await twoFactorService.getTwoFaDetails({
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

export const verifyTwoFactor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = res.locals;

    const { token } = req.body;

    const data = await twoFactorService.verifyTwoFactor({
      user_id: user.id,
      token,
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

export const removeTwoFactor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = res.locals;

    const data = await twoFactorService.removeTwoFactor({
      user_id: user.id,
    });
    return res.status(200).json({
      status: 'success',
      message: 'removed two factor ',
      data,
    });
  } catch (e) {
    next(e);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = res.locals;

    const { new_password, old_password } = req.body;

    const data = await authService.changePassword({
      old_password,
      new_password,
      user_id: user.id,
    });

    return res.status(200).json({
      status: 'success',
      message: 'password changed',
      data,
    });
  } catch (e) {
    next(e);
  }
};
