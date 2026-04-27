import crypto from 'crypto';

export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export const isOTPExpired = (expiresAt: Date): boolean => {
  return new Date() > new Date(expiresAt);
};

export const getOTPExpiryDate = (): Date => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 10); // 10 minutes
  return expiry;
};
