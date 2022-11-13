import { nanoid } from 'nanoid';
import RedisClient from '../config/redis';

import Savings from '../models/savings.model';
import { createToken } from '../services/auth.service';
import HttpError from '../utils/error';

import dayjs from 'dayjs';
import User from '../models/user.model';
import Card from '../models/card.model';

import { chargeBulk } from './flutterwave.service';

const cache = new RedisClient();

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

export const createSavingPlan = async ({
  amount,
  frequency,
  start_date,
  end_date,
  card,
  isAutosave,
  user,
}) => {
  if (isAutosave) {
    const savings = await Savings.findOne({
      user: user.id,
      isAutosave: true,
    });
    if (savings)
      throw new HttpError(
        400,
        'Cannot have multiple plans with automatic debits'
      );
  }
  const start = dayjs(start_date);
  const end = dayjs(end_date);
  if (end.diff(start, 'month') < 2)
    throw new HttpError(400, 'Mininum of 2 months for savings');

  if (card) {
    const ownsCard = await Card.findOne({
      user: user.id,
      _id: card,
    });
    if (!ownsCard) throw new HttpError(404, 'You do not own this card');
  }

  const plan = await Savings.create({
    user: user.id,
    isAutosave,
    end_date: end.format(),
    start_date: start.format(),
    card,
    amount: Number(amount),
    frequency,
  });

  return plan;
};

export const editSavingPlan = async ({
  id,
  amount,
  frequency,
  end_date,
  card,
  active,
  user,
}) => {
  const savingsExist = await Savings.findOne({
    user: user.id,
    _id: id,
    active: true,
  });
  if (!savingsExist) throw new HttpError(401, 'cannot perform this action');
  if (card) {
    const ownsCard = await Card.findOne({
      user: user.id,
      _id: card,
    });
    if (!ownsCard) throw new HttpError(400, 'This Card does not belong to you');
  }
  const end = dayjs(end_date);
  const now = dayjs();

  if (end.diff(now, 'month') < 2)
    throw new HttpError(400, 'Mininum of 2 months for savings');
  await Savings.updateOne(
    {
      _id: savingsExist.id,
    },
    {
      amount,
      frequency,
      end_date,
      card,
      user: user.id,
    }
  );
};

export const getSavingsPlan = async ({ user }) => {
  const savings = await Savings.find({
    user: user.id,
  });

  if (!savings) throw new HttpError(404, 'No savings is attached to this user');

  return savings;
};

export const withdrawSavingsPlan = async ({ user, id }) => {
  const savingsExist = await Savings.findOne({
    user: user.id,
    _id: id,
    active: true,
  });
  if (!savingsExist) throw new HttpError(401, 'cannot perform this action');

  const amount = savingsExist.invested;
  const activeuser = await User.findById(user.id);
  // @ts-ignore
  const newBalance: Number = activeuser.balance + amount;

  await Savings.updateOne(
    {
      _id: id,
    },
    { active: false, invested: 0 }
  );
  await User.updateOne(
    {
      _id: user.id,
    },
    {
      balance: newBalance,
    }
  );
};

export const fundSavingsPlan = async ({ user, amount, id }) => {
  const savingsExist = await Savings.findOne({
    user: user.id,
    _id: id,
    active: true,
  });
  if (!savingsExist) throw new HttpError(401, 'cannot perform this action');

  const activeuser = await User.findById(user.id);
  if (amount > activeuser.balance)
    throw new HttpError(401, 'cannot perform this action, you are broke');

  const newBalance = activeuser.balance - amount;
  await User.updateOne({ _id: user.id }, { balance: newBalance });
  await Savings.updateOne(
    { _id: id },
    { invested: amount + savingsExist.invested }
  );
};
