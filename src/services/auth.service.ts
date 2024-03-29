import { getQueue } from '../config/bull';
import emailVerification from '../models/emailVerification.model';
import { sign, verify } from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import config from '../config';
import bcrypt from 'bcrypt';
import RedisClient from '../config/redis';

import HttpError from '../utils/error';
import userModel from '../models/user.model';

const cache = new RedisClient();

const { secret, expiry } = config.jwt;

export const createToken = (data: object) => {
  const token = sign(data, secret, { algorithm: 'HS256', expiresIn: expiry });
  return token;
};

export const verifyToken = (token: string) => {
  const decoded = verify(token, secret);
  return decoded;
};

export const checkPassword = async (value: String, hashedString: string) => {
  const isMatch = await bcrypt.compare(value, hashedString);
  return isMatch;
};

export const sendEmailVerification = async (email: String) => {
  const emailQueue = getQueue('sendEmail');
  try {
    const id = nanoid();
    const token = await createToken({ email, id });
    const link = `${config.host}/api/v1/email/verify/${token}`;
    await emailVerification.create({
      id,
      token,
      email,
    });

    emailQueue.add({
      payload: {
        to: email,
        subject: 'verify email',
        html: `<p>Email Verification Link: <a>${link}</a></p>`,
      },
    });
    return { msg: 'Email Verification Sent', emailVerification };
  } catch (e) {
    throw new Error('failure in sendEmailVerification');
  }
};

interface userData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  username: string;
}

export const register = async (data: userData) => {
  const { first_name, last_name, email, password, username } = data;
  const userExists = await userModel.findOne({
    $or: [{ email }, { username }],
  });
  if (userExists) {
    throw new HttpError(400, 'Username/email already exists');
  }
  const hashedPassword = await bcrypt.hash(password, 8);
  const user = await userModel.create({
    first_name,
    last_name,
    email,
    password: hashedPassword,
    username,
  });
  await sendEmailVerification(email);
};

export const login = async ({ email, password, two_factor_token }) => {
  const user = await userModel.findOne({ email });

  if (!user) throw new HttpError(400, 'No user found with this email');

  if (!user.isEmailVerified) throw new HttpError(400, 'Email not verified');

  const requiresTwoFactor = !!user.two_factor_authenticator_key;
  // validate password
  const isPassword = await checkPassword(password, user.password);

  if (!isPassword) throw new HttpError(400, 'Incorrect Password');

  if (requiresTwoFactor)
    if (!two_factor_token)
      throw new HttpError(400, 'requires two factor to complete');

  const data = {
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    username: user.username,
    id: user._id.toString(),
  };

  const authToken = await createToken(data);

  await cache.add(data.id, authToken);

  return { authToken, ...data };
};

export const changePassword = async ({
  old_password,
  new_password,
  user_id,
}) => {
  const user = await userModel.findById(user_id);

  const isPassword = await checkPassword(old_password, `${user.password}`);

  if (!isPassword) throw new HttpError(400, 'incorrect password passed');

  const hashedPassword = await bcrypt.hash(new_password, 8);
  await userModel.findByIdAndUpdate(user_id, {
    password: hashedPassword,
  });
};

export const verifyEmail = async ({ token }) => {
  const isValidToken = await verifyToken(token);

  if (!isValidToken) throw new HttpError(400, 'Email Link Expired');

  const tokenExists = await emailVerification.findOne({ token });

  if (!tokenExists)
    throw new HttpError(400, 'Unable to verify email, please try again');

  await userModel.updateOne(
    { email: tokenExists.email },
    { isEmailVerified: true }
  );
  await emailVerification.deleteOne({ token });
};

export const resendEmailVerification = async ({ email }) => {
  const user = await userModel.findOne({ email });
  if (!user) throw new HttpError(400, 'Email not found');
  if (user.isEmailVerified) throw new HttpError(400, 'Email verified already');
  await sendEmailVerification(email);
};
