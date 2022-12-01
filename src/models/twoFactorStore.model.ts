import mongoose from 'mongoose';
const TwoFactorStoreSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    two_factor_authenticator_key: String,
    updated_at: {
      type: Date,
      required: true,
      default: Date.now,
      expires: 180,
    }, // 3mins
  },
  {
    collection: 'TwoFactorStores',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const TwoFactorStoreModel = mongoose.model(
  'TwoFactorStore',
  TwoFactorStoreSchema
);

export default TwoFactorStoreModel;
