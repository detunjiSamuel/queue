import RedisClient from '../config/redis';

import * as flutterwaveService from './flutterwave.service';
import * as authService from './auth.service';
import emitter from '../events/emitter';

const cache = new RedisClient();

export const processWebHook = async (payload) => {
  console.log('webhook processing .....');
  const { id, amount, tx_ref } = payload;
  try {
    // check cache is payment reference exists
    const internalReferenceToken = await cache.get(tx_ref);
    if (!internalReferenceToken)
      throw new Error('Reference does not match one created');
    const tokenData = await authService.verifyToken(internalReferenceToken);
    // check if amount received matchs expected

    const isValid = await flutterwaveService.validatePayment(
      id, // @ts-ignore
      tokenData.amount,
      tx_ref
    );
    if (!isValid) throw new Error('Invalid transaction');

    // @ts-ignore
    if (tokenData.action === 'ADD_CARD' || tokenData.action === 'CHARGE_CARD') {
      //@ts-ignore
      const { email: user_email } = tokenData;

      const card = isValid.card;

      emitter.emit('record_add_card_charge', {
        user_email,
        card,
        amount,
        payload,
      });

      // @ts-ignore
    } else if (tokenData.action === 'FUND_CRYPTO') {
      // @ts-ignore
      const { address, amount } = tokenData;
      emitter.emit('webhooks:coin:fund_crypto', {
        address,
        amount,
        payload,
      });
      // @ts-ignore
    } else if (tokenData.action === 'CHARGE_CARD_SAVINGS') {
      emitter.emit('webhooks:savings:record_card_charge', {
        //@ts-ignore
        savings_id: tokenData.savings,
        amount,
        payload,
      });
    }
    // make reference invalid
    return await cache.delete(tx_ref);
  } catch (e) {
    console.log(e.message);
    return null;
  }
};
