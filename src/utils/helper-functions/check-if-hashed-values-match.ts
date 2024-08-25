import { compare } from 'bcryptjs';

export async function checkIfHashedValuesMatch(value1: string, value2: string) {
  const hashedValuesMatch = await compare(value1, value2);
  return hashedValuesMatch;
}
