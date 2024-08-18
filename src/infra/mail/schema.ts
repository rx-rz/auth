import { z } from 'zod';

export const SendEmailSchema = z.object({
  from: z.string().email().optional(),
  subject: z.string(),
  html: z.string(),
  text: z.string().optional(),
  recipients: z.array(z.string().email()),
  placeholder: z.string().optional(),
});

export type SendEmailDto = z.infer<typeof SendEmailSchema>;
