import { genSaltSync, hashSync } from 'bcryptjs';

export const hashPassword = (plainPassword: string) => {
  let SALT_ROUNDS = genSaltSync(10);
  let hashedPassword = hashSync(plainPassword, SALT_ROUNDS);
  return hashedPassword;
};
