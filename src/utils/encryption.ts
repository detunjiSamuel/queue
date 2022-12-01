import crypto from 'node:crypto';
import config from '../config';

const algorithm = 'aes-256-ctr';

// p.s remember that it the algo uses 256-bit for key
const secretKey = config.cipher.secret_key;
// 128-bit
const iv = config.cipher.iv;

export const encrypt = (text): string => {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return encrypted.toString('hex');
};

export const decrypt = (hash: string) => {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(hash, 'hex')),
    decipher.final(),
  ]);

  return decrypted.toString();
};
