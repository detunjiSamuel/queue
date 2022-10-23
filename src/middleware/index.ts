import { Request, Response, NextFunction } from 'express';
import RedisClient from '../config/redis';
import * as auth from '../services/auth.service';

const cache = new RedisClient();

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authToken = req.headers.authorization?.split(' ');
    if (!authToken || !authToken[1]) {
      return res.status(401).json('Not Authenticated! Please, Login');
    }
    const verified = await auth.verifyToken(authToken[1]);
    // @ts-ignore

    const tokenExists = await cache.get(verified.id);
    // @ts-ignore

    if (verified && verified.id && tokenExists) {
      res.locals.user = verified;
      next();
    } else {
      return res.status(401).json({ msg: 'Not Authenticated! Please, Login' });
    }
  } catch (e) {
    return res.status(401).json({ msg: 'Authentication Error! Please, Login' });
  }
};
