import savingsModel from '../../models/savings.model';
import transactionModel from '../../models/transaction.model';

export default async ({ savings_id, amount, payload }) => {
  try {
    const savings = await savingsModel.findById(savings_id);

    const newInvested = Number(savings.invested) + Number(amount);

    await savingsModel.findByIdAndUpdate(savings_id, {
      invested: newInvested,
    });

    await transactionModel.create({
      user: savings.user,
      ...payload,
    });

    return true;
  } catch (e) {
    console.log(e.message);
  }
};
