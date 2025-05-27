import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { EmailService } from './email.service';
import { Resend } from 'resend';
import { INJECT_RESEND } from './resend-provider';

@Injectable()
export class ResendEmailService implements EmailService {
  constructor(@Inject(INJECT_RESEND) private resend: Resend) {}
  public async sendEmail(to: string, code: string) {
    const { data, error } = await this.resend.emails.send({
      from: 'IDBlock <hello@idblock.id>',
      to: [to],
      subject: 'Welcome to IDBlock',
      html: `<p>Your verification code is <strong>${code}</strong></p>`,
    });

    if (error) {
      throw new BadRequestException(error);
    }

    console.log(data);

    return 'Eemail sent from RESEND';
  }
}
