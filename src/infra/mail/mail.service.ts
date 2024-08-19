import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import { SendEmailDto } from './schema';
import { Address, Options } from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class Mailer {
  constructor(private readonly configService: ConfigService) {}

  transporter() {
    return createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: parseInt(this.configService.get('SMTP_PORT') || ''),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendEmail(dto: SendEmailDto) {
    let response: SMTPTransport.SentMessageInfo | undefined;
    let error: Error | undefined;
    const { html, subject, from, recipients } = dto;
    const transport = this.transporter();
    const options: Options = {
      from: from ?? {
        name: this.configService.get('SMTP_NAME') ?? '',
        address: this.configService.get('SMTP_HOST') ?? '',
      },
      to: recipients,
      subject,
      html,
    };

    try {
      response = await transport.sendMail(options);
    } catch (err) {
      if (err instanceof Error) error = err;
      console.log(err);
    }
    return { error, response };
  }
}
