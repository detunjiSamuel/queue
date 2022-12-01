import { createToken } from './auth.service';
import { nanoid } from 'nanoid';
import RedisClient from '../config/redis';
import { validateAddress } from '../services/binance.service';
import depositRequest from '../models/coinRequest.model';
import { createPaymentLink } from '../services/flutterwave.service';
import { v4 as uuidv4 } from 'uuid';

const withdrawMin = 10;
const withdrawMax = 100000;
const USDT_RATE = 600;

const cache = new RedisClient();

interface fundRequestType {
  email?: string;
  id?: number;
  fullname?: string;
  coinAddress: string;
  phone?: string;
  value: number;
}

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
