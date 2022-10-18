import { nanoid } from 'nanoid';
import RedisClient from '../config/redis';

import Savings from '../models/savings.model';
import AuthService from '../services/auth.service';

import { chargeBulk } from './flutterwave.service';

const cache = new RedisClient();
const { createToken } = new AuthService();

export const processAutosaving = async (frequency: String) => {
  try {
    console.log('handling %s', frequency);
    // get all active plans that fit frequency category
    const savings = await Savings.find({
      frequency,
      active: true,
    })
      .populate('user')
      .populate('card');
    if (!savings) return null;
    const bulk_savings = [];
    for (const saving of savings) {
      const tx_ref = `bulk_charge_${nanoid()}`;
      const payload = {
        savings: saving._id,
        tx_ref,
        amount: saving.amount, // @ts-ignore
        email: saving.user.email,
        currency: 'NGN', // @ts-ignore
        first_name: saving.user.first_name, // @ts-ignore
        last_name: saving.user.last_name,
        ip: 'pstmn', // decided to hardcode this
        // @ts-ignore
        token: saving.card.token,
      };
      const internalReferenceToken = await createToken({
        ...payload,
        action: 'CHARGE_CARD_SAVINGS',
      });
      await cache.add(tx_ref, internalReferenceToken);
      bulk_savings.push(saving);
    }
    // charge all user cards
    await chargeBulk(frequency, bulk_savings);
    return;
  } catch (e) {
    console.log('handle auto savings Err:', e.message);
    throw new Error('Process auto savivngs failed');
  }
};
