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
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 40px; background-color: #ffffff;">
          <div style="max-width: 600px; margin: 0 auto; text-align: center;">
            
            <!-- IDBlock 로고 -->
            <div style="margin-bottom: 10px;">
              <img src="https://d2qilacgdmcy5c.cloudfront.net/idblock_icon.png" alt="IDBlock" style="width: 60px; height: 60px; border-radius: 16px;" />
            </div>
            
            <!-- 메인 제목 -->
            <h1 style="color: #333333; font-size: 28px; font-weight: 400; margin: 0 0 60px 0; line-height: 1.3;">
              Here's your IDBlock launch code!
            </h1>
            
            <!-- 편지봉투 아이콘 -->
            <div style="margin-bottom: 25px;">
              <img src="https://d2qilacgdmcy5c.cloudfront.net/postImage.png" alt="Mail" style="width: 140px; height: auto;" />
            </div>
            
            <!-- 인증 코드 안내 텍스트 -->
            <p style="color: #666666; font-size: 18px; margin: 0 0 10px 0; font-weight: 400;">
              Your verification code is:
            </p>
            
            <!-- 인증 코드 -->
            <div style="margin: 20px 0 50px 0;">
              <div style="font-size: 48px; font-weight: bold; color: #000000; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${code}
              </div>
            </div>
            
            <!-- 하단 안내 메시지 -->
            <p style="color: #888888; font-size: 16px; line-height: 1.5; margin: 0; max-width: 400px; margin-left: auto; margin-right: auto;">
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
