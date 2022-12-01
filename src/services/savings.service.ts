import { nanoid } from 'nanoid';
import RedisClient from '../config/redis';

import savingsModel from '../models/savings.model';
import * as authService from '../services/auth.service';
import HttpError from '../utils/error';

import dayjs from 'dayjs';
import userModel from '../models/user.model';
import cardModel from '../models/card.model';

import * as flutterwaveService from './flutterwave.service';

const cache = new RedisClient();

export const processAutosaving = async (frequency: String) => {
  try {
    console.log('handling %s', frequency);
    // get all active plans that fit frequency category

    const savings = await savingsModel
      .find({
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

      const internalReferenceToken = await authService.createToken({
        ...payload,
        action: 'CHARGE_CARD_SAVINGS',
      });

      await cache.add(tx_ref, internalReferenceToken);

      bulk_savings.push(saving);
    }
    // charge all user cards
    await flutterwaveService.chargeBulk(frequency, bulk_savings);

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
    const savings = await savingsModel.findOne({
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
    const ownsCard = await cardModel.findOne({
      user: user.id,
      _id: card,
    });
    if (!ownsCard) throw new HttpError(404, 'You do not own this card');
  }

  const plan = await savingsModel.create({
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
  const savingsExist = await savingsModel.findOne({
    user: user.id,
    _id: id,
    active: true,
  });

  if (!savingsExist) throw new HttpError(401, 'cannot perform this action');

  if (card) {
    const ownsCard = await cardModel.findOne({
      user: user.id,
      _id: card,
    });

    if (!ownsCard) throw new HttpError(400, 'This Card does not belong to you');
  }
  const end = dayjs(end_date);
  const now = dayjs();

  if (end.diff(now, 'month') < 2)
    throw new HttpError(400, 'Mininum of 2 months for savings');

  await savingsModel.updateOne(
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
  const savings = await savingsModel.find({
    user: user.id,
  });

  if (!savings) throw new HttpError(404, 'No savings is attached to this user');

  return savings;
};

export const withdrawSavingsPlan = async ({ user, id }) => {
  const savingsExist = await savingsModel.findOne({
    user: user.id,
    _id: id,
    active: true,
  });

  if (!savingsExist) throw new HttpError(401, 'cannot perform this action');

  const amount = savingsExist.invested;

  const activeuser = await userModel.findById(user.id);
  // @ts-ignore
  const newBalance: Number = activeuser.balance + amount;

  await savingsModel.updateOne(
    {
      _id: id,
    },
    { active: false, invested: 0 }
  );

  await userModel.updateOne(
    {
      _id: user.id,
    },
    {
      balance: newBalance,
    }
  );
};

export const fundSavingsPlan = async ({ user, amount, id }) => {
  const savingsExist = await savingsModel.findOne({
    user: user.id,
    _id: id,
    active: true,
  });

  if (!savingsExist) throw new HttpError(401, 'cannot perform this action');

  const activeuser = await userModel.findById(user.id);

  if (amount > activeuser.balance)
    throw new HttpError(401, 'cannot perform this action, you are broke');

  const newBalance = activeuser.balance - amount;

  await userModel.updateOne({ _id: user.id }, { balance: newBalance });

  await savingsModel.updateOne(
    { _id: id },
    { invested: amount + savingsExist.invested }
  );
};
