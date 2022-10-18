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
export default mongoose.model('depositRequest', depositRequestSchema);
