import Card from '../src/models/card.model';
import CoinRequest from '../src/models/coinRequest.model';
import EmailVerification from '../src/models/emailVerification.model';
import Transaction from '../src/models/transaction.model';
import User from '../src/models/user.model';
import Savings from '../src/models/savings.model';

import startDb from '../src/config/database';

import { writeFile } from 'fs/promises';

// Generate seed data from my local DB
async function extractor() {
  startDb();
  try {
    await handleAll({
      User,
      Card,
      Transaction,
      EmailVerification,
      CoinRequest,
      Savings,
    });
    console.log('extration complete');
  } catch (e) {
    console.log(e.message);
    console.error('handle All failed');
  }
}

async function handleAll(models: any) {
  for (const model in models) {
    console.log(`${model} extration`);
    const content = JSON.stringify(await models[model].find());
    await writeFile(`./seed/data/${model}.json`, content, 'utf8');
    console.log('The file was saved!');
  }
  return;
}

extractor();
