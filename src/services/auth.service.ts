import { emailQueue } from '../config/bull';
import emailVerification from '../models/emailVerification.model';
import { sign, verify } from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import config from '../config';
import bcrypt from 'bcrypt';
import RedisClient from '../config/redis';

import User from '../models/user.model';

import HttpError from '../utils/error';

const cache = new RedisClient();

const { secret, expiry } = config.jwt;

interface userData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  username: string;
}
class Auth {
  async register(data: userData) {
    const { first_name, last_name, email, password, username } = data;
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      throw new HttpError(400, 'Username/email already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      username,
    });
    await this.sendEmailVerification(email);
  }

  async login(email: String, password: string) {
    const user = await User.findOne({ email });
    if (!user) throw new HttpError(400, 'No user found with this email');
    if (!user.isEmailVerified) throw new HttpError(400, 'Email not verified');
    // validate password
    const isPassword = await this.checkPassword(password, user.password);
    if (!isPassword) throw new HttpError(400, 'Incorrect Password');
    const data = {
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      id: user._id.toString(),
    };
    const authToken = await this.createToken(data);
    await cache.add(data.id, authToken);
    return { authToken, data };
  }

  async sendEmailVerification(email: String) {
    try {
      const id = nanoid();
      const token = await this.createToken({ email, id });
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
  }

  createToken(data: object) {
    const token = sign(data, secret, { algorithm: 'HS256', expiresIn: expiry });
    return token;
  }

  verifyToken(token: string) {
    const decoded = verify(token, secret);
    return decoded;
  }

  async checkPassword(value: String, hashedString: string) {
    const isMatch = await bcrypt.compare(value, hashedString);
    return isMatch;
  }
}

export default Auth;
