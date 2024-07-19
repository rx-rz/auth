import { genSalt, hash } from 'bcryptjs';

export const hashValue = async (value: string) => {
  let SALT_ROUNDS = await genSalt(8);
  let hashedValue = await hash(value, SALT_ROUNDS);
  return hashedValue;
};
