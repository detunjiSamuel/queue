import Card from '../src/models/card.model';
import CoinRequest from '../src/models/coinRequest.model';
import EmailVerification from '../src/models/emailVerification.model';
import Transaction from '../src/models/transaction.model';
import User from '../src/models/user.model';
import Savings from '../src/models/savings.model';

import startDb from '../src/config/database';

import { readFile } from 'fs/promises';

async function seed() {
  startDb();
  await handleAll({
    User,
    Card,
    Transaction,
    EmailVerification,
    CoinRequest,
    Savings,
  });
  console.log('seed complete');
  process.exit(0);
}

async function handleAll(models: any) {
  for (const model in models) {
    await models[model].deleteMany({}); // remove for production
    console.log(`${model} seed`);
    const contents = JSON.parse(
      await readFile(`./seed/data/${model}.json`, 'utf-8')
    );
    await models[model].create(contents);
    console.log('insert complete');
  }
}

seed();
