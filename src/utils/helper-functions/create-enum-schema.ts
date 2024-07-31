import { z } from "zod";

export function createEnumSchema<T extends string>(enumObj: { [key: string]: T }) {
  return z.enum(Object.values(enumObj) as [T, ...T[]]);
}