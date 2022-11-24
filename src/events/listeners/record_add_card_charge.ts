import cardModel from '../../models/card.model';
import transactionModel from '../../models/transaction.model';
import userModel from '../../models/user.model';

export default async ({ user_email, card, amount, payload }) => {
  try {
    const user = await userModel.findOne({
      email: user_email,
    });

    if (card)
      // && action is add_card
      await cardModel.create({
        ...card,
        user: user._id,
      });

    const newBalance = Number(user.balance) + Number(amount);
    await userModel.findByIdAndUpdate(user._id, {
      balance: newBalance,
    });

    await transactionModel.create({
      ...payload,
      user: user._id,
    });
    return true;
  } catch (e) {
    console.log(e.message);
  }
};
