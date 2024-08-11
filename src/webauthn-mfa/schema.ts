import { z } from 'zod';

export const VerifyChallengeSchema = z.object({
  username: z.string().min(1, { message: 'Username cannot be empty' }),
  credential: z.object(
    {
      id: z.string().min(1, { message: 'Credential ID is required' }),
      publicKey: z.string().min(1, { message: 'Public key is required' }),
      algorithm: z.enum(['RS256', 'ES256'], {
        errorMap: () => ({ message: "Algorithm must be either 'RS256' or 'ES256'" }),
      }),
    },
    { required_error: 'Credential information is required' },
  ),
  authenticatorData: z.string().min(1, { message: 'Authenticator data is required' }),
  clientData: z.string().min(1, { message: 'Client data is required' }),
  attestationData: z.string().optional(),
});

export type VerifyChallengeDto = z.infer<typeof VerifyChallengeSchema>;
