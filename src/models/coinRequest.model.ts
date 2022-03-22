import * as mongoose from 'mongoose';
const depositRequestSchema = new mongoose.Schema(
  {
    email: {
      type: String,
    },
    name: {
      type: String,
    },
    tx_ref: {
      type: String,
    },
    coin: {
      type: String,
    },
    network: {
      type: String,
    },
    coinAddress: {
      type: String,
    },
    amount: {
      type: Number,
    },
    value: {
      type: Number,
    },
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
