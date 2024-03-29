import * as mongoose from 'mongoose';

const emailVerification = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      lowercase: true,
      index: true,
    },
    token: {
      type: String,
      unique: true,
      index: true,
    },
  },
  { timestamps: true }
);

const EmailVerificationModel = mongoose.model(
  'emailVerification',
  emailVerification
);

export default EmailVerificationModel;
