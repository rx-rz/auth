import { z } from 'zod';

export const EmailSchema = z.object({
  email: z
    .string({ required_error: 'Email required' })
    .email({ message: 'Invalid email provided' }),
});

export type EmailDto = z.infer<typeof EmailSchema>;

export const VerifyMfaRegistrationSchema = z.object({
  email: z.string().email(),
  webAuthnUserId: z.string(),
  options: z.object({
    id: z.string(),
    rawId: z.string(),
    response: z.object({
      attestationObject: z.string(),
      clientDataJSON: z.string(),
      transports: z.array(z.string()),
      publicKeyAlgorithm: z.number(),
      publicKey: z.string(),
      authenticatorData: z.string(),
    }),

    clientExtensionResults: z.object({
      credProps: z.object({
        rk: z.boolean(),
      }),
    }),
    authenticatorAttachment: z.string(),
    type: z.string(),
  }),
});

export type VerifyMfaRegistrationDto = z.infer<typeof VerifyMfaRegistrationSchema>;
