import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import emailVerification from '../models/emailVerification.model';
import AuthService from '../services/auth.service';
import RedisClient from '../config/redis';
import HttpError from '../utils/error';

const service = new AuthService();
const cache = new RedisClient();

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { first_name, last_name, email, password, username } = req.body;
  try {
    await service.register({
      first_name,
      last_name,
      email,
      password,
      username,
    });
    return res.status(201).json({
      msg: 'Account Created',
      user: {
        email: email || 'test',
        username: username || 'more',
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
  const { email, password } = req.body;
  try {
    const { authToken, data } = await service.login(email, password);
    return res.status(200).json({
      msg: 'Login Successful!',
      data,
      authToken,
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
  const { user } = req.body;
  try {
    const removedToken = await cache.delete(user.id);
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
    const isValidToken = await service.verifyToken(token);
    if (!isValidToken) throw new HttpError(400, 'Email Link Expired');
    const tokenExists = await emailVerification.findOne({ token });
    if (!tokenExists)
      throw new HttpError(400, 'Unable to verify email, please try again');
    const user = await User.updateOne(
      { email: tokenExists.email },
      { isEmailVerified: true }
    );
    await emailVerification.deleteOne({ token });
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
    const user = await User.findOne({ email });
    if (!user) throw new HttpError(400, 'Email not found');
    if (user.isEmailVerified)
      throw new HttpError(400, 'Email verified already');
    await service.sendEmailVerification(email);
    return res.status(200).json({
      msg: 'Verification Email Resent!',
      email,
    });
  } catch (e) {
    next(e);
  }
};
