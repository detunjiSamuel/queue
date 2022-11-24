import transactionModel from '../../models/transaction.model';
import * as binanceService from '../../services/binance.service';
export default async ({ address, amount, payload }) => {
  try {
    await transactionModel.create({
      ...payload,
    });

    await binanceService.transferCoin(address, amount);

    return true;
  } catch (e) {
    console.log(e.message);
  }
};
