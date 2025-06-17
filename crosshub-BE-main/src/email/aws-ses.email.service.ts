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
              <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #f9f9f9;">
                <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 32px; border-radius: 8px; text-align: center;">
                  <h2 style="color: #333;">Welcome to IDBlock!</h2>
                  <p style="color: #555;">Your verification code is:</p>
                  <p style="font-size: 32px; color: #007BFF; font-weight: bold; letter-spacing: 4px;">${code}</p>
                  <p style="color: #888;">Please enter this code in the app to continue your signup process.</p>
                </div>
              </div>
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
