import transactionModel from '../models/transaction.model';

export const getTransactions = async ({ user_id }) => {
  const transactions = await transactionModel.find({
    user: user_id,
  });
  return transactions;
};
