import { z } from 'zod';

export const SendEmailSchema = z.object({
  from: z.string().email().optional(),
  subject: z.string(),
  html: z.string(),
  recipients: z.array(z.string().email()),
});

export type SendEmailDto = z.infer<typeof SendEmailSchema>;
