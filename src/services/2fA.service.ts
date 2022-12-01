import authenticator from 'authenticator';
import qrcode from 'qrcode';
import userModel from '../models/user.model';
import HttpError from '../utils/error';
import TwoFactorStoreModel from '../models/twoFactorStore.model';
import * as encryptionUtil from '../utils/encryption';

const generate2FAInfo = async ({ two_factor_authenticator_key, email }) => {
  const url = authenticator.generateTotpUri(
    two_factor_authenticator_key,
    email,
    `Queue-service`,
    'SHA1',
    6,
    30
  );
  const qr = await qrcode.toDataURL(`${url}`);

  return {
    qr,
    url,
    two_factor_authenticator_key,
  };
};

export const setupAuthenticator = async ({ user_id }) => {
  try {
    const user = await userModel.findById(user_id);

    if (user.two_factor_authenticator_key)
      throw new HttpError(403, '2FA exists', '2FAexistsForUser');

    const two_factor_authenticator_key = authenticator.generateKey();
    const twoFactorInfo = await generate2FAInfo({
      two_factor_authenticator_key,
      email: user.email,
    });

    await TwoFactorStoreModel.create({
      two_factor_authenticator_key: encryptionUtil.encrypt(
        two_factor_authenticator_key
      ),
      user: user_id,
    });

    return {
      ...twoFactorInfo,
    };
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const isValidAuthenticatorToken = async ({ user_id, token }) => {
  const user = await userModel.findById(user_id);

  if (!user.two_factor_authenticator_key)
    throw new HttpError(403, 'does not have 2FA activated');

  const verified = authenticator.verifyToken(
    encryptionUtil.decrypt(`${user.two_factor_authenticator_key}`),
    token
  );

  return verified !== null;
};

export const getTwoFaDetails = async ({ user_id }) => {
  const user = await userModel.findById(user_id);

  if (!user.two_factor_authenticator_key)
    throw new HttpError(403, 'does not have 2FA activated');

  const twoFactorInfo = await generate2FAInfo({
    two_factor_authenticator_key: encryptionUtil.decrypt(
      `${user.two_factor_authenticator_key}`
    ),
    email: user.email,
  });

  return {
    ...twoFactorInfo,
  };
};

export const removeTwoFactor = async ({ user_id }) => {
  const user = await userModel.findById(user_id);

  if (!user.two_factor_authenticator_key)
    throw new HttpError(403, 'does not have 2FA activated');

  await userModel.findByIdAndUpdate(user_id, {
    two_factor_authenticator_key: null,
  });
};

export const verifyTwoFactor = async ({ user_id, token }) => {
  const twoFactorInfo = await TwoFactorStoreModel.findOne({
    user: user_id,
  });

  if (!twoFactorInfo)
    throw new HttpError(400, 'Does not have unverified 2fa setup');

  const { two_factor_authenticator_key } = twoFactorInfo;

  const verified = authenticator.verifyToken(
    encryptionUtil.decrypt(`${two_factor_authenticator_key}`),
    token
  );

  const isValid = verified !== null;

  if (!isValid) throw new HttpError(400, 'Invalid token passed');

  await userModel.findByIdAndUpdate(user_id, {
    two_factor_authenticator_key: encryptionUtil.encrypt(
      two_factor_authenticator_key
    ),
  });

  await TwoFactorStoreModel.findByIdAndDelete(twoFactorInfo._id);
};
