import * as mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  first_6digits: String,
  last_4digits: String,
  issuer: String,
  country: String,
  type: String,
  token: String,
  expiry: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

export default mongoose.model('Card', cardSchema);
