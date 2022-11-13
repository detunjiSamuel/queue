import HttpError from '../utils/error';
import { createToken, verifyToken } from '../services/auth.service';
import RedisClient from '../config/redis';

import Card from '../models/card.model';
import { getQueue } from '../config/bull';
import { nanoid } from 'nanoid';
import Flutterwave from 'flutterwave-node-v3';
import config from '../config/index';
import * as helper from '../helpers/card';

const { flutterwave } = config;

const cache = new RedisClient();
const flw = new Flutterwave(flutterwave.public, flutterwave.private);

export const chargeCard = async (user, amount, id) => {
  const chargeQueue = getQueue('charge_card');
  const emailQueue = getQueue('sendEmail');

  const ownsCard = await Card.findOne({
    user: user.id,
    _id: id,
  });
  if (!ownsCard) throw new HttpError(404, 'This Card does not belong to you');
  const tx_ref = `charge_${nanoid()}`;
  const payload = {
    tx_ref,
    email: user.email,
    amount,
    action: 'CHARGE_CARD',
  };
  const internalReferenceToken = await createToken(payload);
  await cache.add(tx_ref, internalReferenceToken);
  await chargeQueue.add({
    payload: {
      ...payload,
      first_name: user.first_name,
      last_name: user.last_name,
      narration: 'CHARGE_CARD',
      redirect_url: 'https://www.google.com',
      currency: 'NGN',
      country: 'NG',
      token: ownsCard.token,
    },
  });
  await emailQueue.add({
    payload: {
      to: user.email,
      subject: 'Credit with card',
      html: `<p>${amount} was credited to your wallet</p>`,
    },
  });
};

export const getCard = async (user) => {
  const cards = await Card.find({
    user: user.id,
  });
  if (cards) return cards;
  throw new HttpError(404, 'No card is attached to this user');
};

export const removeCard = async (user, cardId) => {
  const ownsCard = await Card.findOne({
    user: user.id,
    _id: cardId,
  });
  if (!ownsCard) throw new HttpError(400, 'This Card does not belong to you');
  await Card.deleteOne({
    _id: cardId,
  });
};

export const validateCardOtp = async (otp, transactionReference) => {
  const paymentToken = await cache.get(`opt-${transactionReference}`);
  if (!paymentToken)
    throw new HttpError(401, 'Invalid payment reference passed');
  const tokenData = await verifyToken(paymentToken);
  const validate = await flw.Charge.validate({
    otp,
    // @ts-ignore
    flw_ref: tokenData.flw_ref,
  });
  await cache.delete(`opt-${transactionReference}`);
  if (validate.message === 'Charge validated') return true;
};

export const addCard = async ({
  card_number,
  cvv,
  expiry_month,
  expiry_year,
  pin,
  user,
  city,
  address,
  state,
  country,
  zipcode,
}) => {
  const payload = helper.generatePayload({
    card_number,
    cvv,
    expiry_month,
    expiry_year,
    ...user,
    pin,
    city,
    address,
    state,
    country,
    zipcode,
  });

  const response = await flw.Charge.card(payload);

  console.log(response);

  if (response.status === 'error' || response.status.includes('fail'))
    throw new HttpError(401, 'This card cannot be accepted');

  const directive = response.meta?.authorization.mode;

  const moreInfoNeeded = ['pin', 'avs_noauth'];

  if (moreInfoNeeded.includes(directive)) {
    return {
      msg: 'more information required',
      data: [
        ...response.meta.authorization.fields.map(
          (field) => `${field} required`
        ),
      ],
    };
  } else if (directive === 'redirect') {
    return {
      msg: 'Complete add action with link',
      link: response.meta.authorization.redirect,
      action: 'redirect',
    };
  } else if (directive === 'otp') {
    payload.flw_ref = response.data.flw_ref;
    const payloadToken = await createToken({
      ...payload,
      action: 'OTP_VALIDATION',
    });
    // check exists then override
    console.log('tx_ref:', payload.tx_ref);
    await cache.add(`opt-${payload.tx_ref}`, payloadToken);

    const internalReferenceToken = await createToken({
      tx_ref: payload.tx_ref,
      flw_ref: response.data.flw_ref,
      email: payload.email,
      amount: payload.amount,
      action: 'ADD_CARD',
    });

    await cache.add(payload.tx_ref, internalReferenceToken);

    return {
      msg: response.data.processor_response,
      data: ['pin required'],
      route: `/card/${payload.tx_ref}/validate`,
    };
  } else {
    // check
    // the data.status field will be either "successful" or "failed".
    console.log('last alternative hit');

    return {
      msg: 'Card processing in progress',
    };
  }
};
