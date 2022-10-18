import { v4 as uuidv4 } from 'uuid';
import { createPaymentLink } from '../services/flutterwave.service';
import depositRequest from '../models/coinRequest.model';
import { validateAddress } from '../services/binance.service';
import { nanoid } from 'nanoid';

import RedisClient from '../config/redis';
import { createToken } from '../services/auth.service';

const withdrawMin = 10;
const withdrawMax = 100000;
const USDT_RATE = 600;

interface fundRequestType {
  email?: string;
  id?: number;
  fullname?: string;
  coinAddress: string;
  phone?: string;
  value: number;
}

const cache = new RedisClient();

export const fundRequest = async (req, res) => {
  const { email, fullname, coinAddress, value } = req.body;
  const data = {
    email,
    fullname,
    coinAddress,
    value,
  };
  const paymentLink = await processCoinRequest(data);
  res.status(200).json({ paymentLink });
};

export const processCoinRequest = async (payload: fundRequestType) => {
  console.log('fund request in progress');
  const { value, fullname, email } = payload;
  if (value < withdrawMin || value > withdrawMax) return null;
  const tx_ref = `TOKEN_REQ_${nanoid()}`;
  const internalReferenceToken = await createToken({
    tx_ref: tx_ref,
    email: email,
    amount: value,
    action: 'FUND_CRYPTO',
  });
  await cache.add(tx_ref, internalReferenceToken);
  const data = {
    ...payload,
    tx_ref: uuidv4(),
    name: fullname,
    coin: 'USDT',
    network: validateAddress(payload.coinAddress),
    amount: value * USDT_RATE,
  };
  await depositRequest.create({ ...data });
  return await createPaymentLink({
    ...data,
  });
};
