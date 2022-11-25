import * as mongoose from 'mongoose';
const depositRequestSchema = new mongoose.Schema(
  {
    email: String,
    name: String,
    tx_ref: String,
    coin: String,
    network: String,
    coinAddress: String,
    amount: Number,
    value: Number,
    status: {
      type: String,
      default: 'pending',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const DepositRequestModel = mongoose.model(
  'depositRequest',
  depositRequestSchema
);
export default DepositRequestModel;
