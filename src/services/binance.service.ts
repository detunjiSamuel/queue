import { Spot } from '@binance/connector';

import config from '../config';

const COIN = 'USDT';

const { binance } = config;
const client = new Spot(binance.key, binance.secret);

//  regex for crypto network
const coinRegexs = {
  TRX: '^T[1-9A-HJ-NP-Za-km-z]{33}$',
  BSC: '^(0x)[0-9A-Fa-f]{40}$',
};

export const transferCoin = async (address, amount) => {
  const network = validateAddress(address);
  if (network) {
    const options = {
      transactionFeeFlag: true,
      network,
    };
    await client.withdraw(COIN, address, amount, options);
    console.log('withdrawal completed');
  } else {
    console.log('trigger dispute ...');
  }
};
export const validateAddress = (address) => {
  for (const coinRegex in coinRegexs) {
    const rule = new RegExp(coinRegexs[coinRegex]);
    if (rule.test(address)) return coinRegex;
  }
  return false;
};

export const getUserInfo = async () => {
  console.log('getting user info ...');
  const { data } = await client.account();
  return data;
  // client.logger.log(data)
};

export const getCoinInfo = async () => {
  console.log('getting coin info ...');
  const { data } = await client.coinInfo();
  // client.logger.log(data)
  return data;
};
