import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { EmailService } from './email.service';
import { Resend } from 'resend';
import { INJECT_RESEND } from './resend-provider';

@Injectable()
export class ResendEmailService implements EmailService {
  constructor(@Inject(INJECT_RESEND) private resend: Resend) {}
  public async sendEmail(to: string, code: string) {
    const { data, error } = await this.resend.emails.send({
      from: 'IDBlock <idblock@idblock.id>',
      to: [to],
      subject: '[IDBlock] Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 32px; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 32px; border-radius: 8px; text-align: center;">
            <img src="https://d2qilacgdmcy5c.cloudfront.net/idblock_icon.png" alt="logo" style="width: 48px;" />
            
            <h2 style="color: #333;">VERIFY YOUR EMAIL ADDRESS</h2>
            
            <div style="border-bottom: 1px solid #f4f4f4; margin: 32px 0;"></div>
            
            <p style="color: #555;">Your verification code is:</p>
            
            <div style="display: inline-block; margin: 24px 0;">
              <div style="background-color: #f9f9f9; width: fit-content; border-radius: 8px; padding: 12px;">
                <span style="display: inline-block; margin: 0 4px; color: #ff5520; font-size: 32px; font-weight: bold; letter-spacing: 10px;">
                  ${code}
                </span>
              </div>
            </div>

            <p style="color: #888;">
              Please enter this code in the app to continue your signup process.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      throw new BadRequestException(error);
    }

    console.log(data);

    return 'Eemail sent from RESEND';
  }
}
