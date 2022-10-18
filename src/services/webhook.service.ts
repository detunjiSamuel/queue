import RedisClient from '../config/redis';

import User from '../models/user.model';
import Savings from '../models/savings.model';
import Card from '../models/card.model';
import transactions from '../models/transaction.model';

import { transferCoin } from './binance.service';
import { validatePayment } from './flutterwave.service';
import { verifyToken } from './auth.service';

const cache = new RedisClient();

export const processWebHook = async (payload) => {
  console.log('webhook processing .....');
  const { id, amount, tx_ref } = payload;
  try {
    // check cache is payment reference exists
    const internalReferenceToken = await cache.get(tx_ref);
    if (!internalReferenceToken)
      throw new Error('Reference does not match one created');
    const tokenData = await verifyToken(internalReferenceToken);
    // check if amount received matchs expected
    // @ts-ignore
    const isValid = await validatePayment(id, tokenData.amount, tx_ref);
    if (!isValid) throw new Error('Invalid transaction');

    // @ts-ignore
    if (tokenData.action === 'ADD_CARD' || tokenData.action === 'CHARGE_CARD') {
      const user = await User.findOne({
        // @ts-ignore
        email: tokenData.email,
      });
      // @ts-ignore

      if (tokenData.action === 'ADD_CARD' && isValid.card)
        await Card.create({
          ...isValid.card,
          user: user._id,
        });
      // Creadit user with amount
      const balance = user.balance + Number(amount);
      // @ts-ignore

      await User.updateOne({ email: tokenData.email }, { balance });
      await transactions.create({ ...payload, user: user._id });
      // @ts-ignore
    } else if (tokenData.action === 'FUND_CRYPTO') {
      await transactions.create({
        ...payload,
      });
      // transafer USDT token
      // @ts-ignore

      await transferCoin(tokenData.address, tokenData.amount);
      // @ts-ignore
    } else if (tokenData.action === 'CHARGE_CARD_SAVINGS') {
      // Credit user savings plan
      const savings = await Savings.findOne({
        // @ts-ignore

        _id: tokenData.savings,
      });
      // @ts-ignore

      const invested = savings.invested + Number(amount);
      // @ts-ignore

      await Savings.updateOne({ _id: tokenData.savings }, { invested });
      await transactions.create({ ...payload, user: savings.user });
    }
    // make reference invalid
    return await cache.delete(tx_ref);
  } catch (e) {
    console.log(e.message);
    return null;
  }
};
