import mongoose from 'mongoose';
import config from '.';

export default async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/fundwallet', async () => {
    console.log('db started');
    // to add run seed here
  });
};
