import * as mongoose from 'mongoose';
const cardSchema = new mongoose.Schema({
  first_6digits: String,
  last_4digits: String,
  issuer: String,
  country: String,
  type: String,
  expiry: String,
});
const transactionSchema = new mongoose.Schema(
  {
    id: String,
    payment_type: String,
    tx_ref: String,
    flw_ref: String,
    amount: Number,
    charged_amount: String,
    status: String,
    card: {
      type: cardSchema,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);
export default mongoose.model('transaction', transactionSchema);
