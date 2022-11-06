import config from '../config/index';
import { nanoid } from 'nanoid';

const { flutterwave } = config;

export function generatePayload(data: any) {
  if (data.pin)
    data.authorization = {
      mode: 'pin',
      fields: ['pin'],
      pin: data.pin,
    };
  // remove excess from db
  delete data.iat;
  delete data.exp;
  delete data.id;
  data.tx_ref = `add_${nanoid()}`;
  data.fullname = data.first_name + ' ' + data.last_name;
  return {
    ...data,
    redirect_url: 'https://www.google.com',
    enckey: flutterwave.encrypt,
    phone_number: '0902620185', // i dont collect numbers so will use this one
    currency: 'NGN',
    amount: '100',
  };
}
