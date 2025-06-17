import { Inject, Injectable } from '@nestjs/common';
import { EmailService } from './email.service';
import { INJECT_SES } from './ses-provider';
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';

@Injectable()
export class AwsSesEmailService implements EmailService {
  constructor(@Inject(INJECT_SES) private readonly sesClient: SESClient) {}
  public async sendEmail(to: string, code: string) {
    const sendEmailCommand = new SendEmailCommand({
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `
              <p>Your verification code is <strong>${code}</strong></p>
            `,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: '[IDBlock] Verify Your Email',
        },
      },
      Source: 'idblock@idblock.id',
      // Source: 'hkchae@buttersoft.io',
    });
    const result = await this.sesClient.send(sendEmailCommand);
    return result.MessageId ?? 'Error';
  }
}
