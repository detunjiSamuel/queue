import { Request, Response } from 'express';
import { getQueue } from '../config/bull';

import config from '../config';

export const flutterwave = async (req: Request, res: Response) => {
  const flwWebHookQueue = getQueue('Flw_webHook');
  const hash = req.headers['verif-hash'];
  const secret_hash = config.flutterwave.hash;
  if (!hash || hash !== secret_hash) return res.end();
  const { data } = req.body;
  await flwWebHookQueue.add(data);
  res.end();
};
