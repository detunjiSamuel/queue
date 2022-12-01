import { Request, Response, NextFunction } from 'express';

import * as authService from '../services/auth.service';
import RedisClient from '../config/redis';

const cache = new RedisClient();

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { first_name, last_name, email, password, username } = req.body;
  try {
    await authService.register({
      first_name,
      last_name,
      email,
      password,
      username,
    });
    return res.status(201).json({
      status: 'success',
      message: 'Account Created',
      data: {
        email,
        username,
        first_name,
        last_name,
      },
    });
  } catch (e) {
    next(e);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password, two_factor_token } = req.body;
  try {
    const data = await authService.login({
      email,
      password,
      two_factor_token,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Login Successful!',
      data,
    });
  } catch (e) {
    next(e);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user } = res.locals;
  try {
    await cache.delete(user.id);
    return res.status(200).json({
      msg: 'Logout Successful!',
    });
  } catch (e) {
    next(e);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { token } = req.params;
  try {
    await authService.verifyEmail({ token });
    return res.status(200).json({
      msg: 'Email Verified!',
    });
  } catch (e) {
    next(e);
  }
};

export const resendEmailVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;
  try {
    await authService.resendEmailVerification({
      email,
    });
    return res.status(200).json({
      msg: 'Verification Email Resent!',
      email,
    });
  } catch (e) {
    next(e);
  }
};
