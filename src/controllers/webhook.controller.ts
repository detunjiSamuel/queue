import { Request, Response } from 'express';
import { flwWebHookQueue } from '../config/bull';

import config from '../config';

export const flutterwave = async (req: Request, res: Response) => {
  const hash = req.headers['verif-hash'];
  const secret_hash = config.flutterwave.hash;
  if (!hash || hash !== secret_hash) return res.end();
  const { data } = req.body;
  await flwWebHookQueue.add(data);
  res.end();
};
