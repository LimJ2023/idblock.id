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
            <div style="margin-bottom: 40px;">
              <img src="" alt="IDBlock" style="width: 80px; height: 80px; border-radius: 16px;" />
            </div>
            
            <!-- 메인 제목 -->
            <h1 style="color: #333333; font-size: 28px; font-weight: 400; margin: 0 0 50px 0; line-height: 1.3;">
              Here's your IDBlock launch code!
            </h1>
            
            <!-- 편지봉투 아이콘 -->
            <div style="margin-bottom: 40px;">
              <img src="https://crosshub-dev.s3.ap-northeast-2.amazonaws.com/public/postImage.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAQSOI4XGLQSGCI2BR%2F20250721%2Fap-northeast-2%2Fs3%2Faws4_request&X-Amz-Date=20250721T085703Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELn%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaDmFwLW5vcnRoZWFzdC0yIkYwRAIgQCJtxTzw6%2F%2F5bhMZrSA3UYccGfvvP3A08oqxHH8I4LMCIBsXZCOw4hDWO3kvVAOHrRgLodK%2FPDTdGVP%2BV45qJfCiKoADCNL%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMMDM5NjEyODg5NDk1Igwi9z0Pno76KfTYKhQq1AInGxOmm14r6e6PoJ%2FN0hBTghgLeZuccGtJNtdX9gGdHt5HRUlp0Sr4ehnmGxPJtBSr0noy3eQbYsl5Go2ZgYbBzrJ509zUm%2FsNLlfW9wUKYcxnhyis8a%2Bv8J6Bl5bzu5uFtklvQqOb6aQWAuT%2FHKHSAvshkkaG8smh0xMoGMgrhfzotAMi5UzcWHE1FlqVV%2BbWgEAQxVbSFv4AlUmKthG1D0adYfUCiZ%2B2wGkhtpS3AQ9L7GE9sk24sjACTR70wX%2FtfUjQNbsIXm1fdJsWQJR%2BuIp%2BZ7aez2TLpA%2FfRW7DxwPMZs5YLR7i3hxiO4%2B2tyR3mnWsVLAApB8ES%2B0vS5uaUHY04mDJF%2BiSTtpchSdoBkdeOBPNhTnsJu4hexnhDPpUIvswbXIxz60v5qm9Xz1KZbX2rhusLJusaN7zChHy%2Ffyit2xMuuylQ9Em8pUu4NH8VvNgMM%2BA%2BMMGOq4CzbIfuhX0kJFShz%2BXSCBGObxKAwKO0YioCPyakgHW5vfpa7nE6OB%2BKTUVBKzxFIYZJq66qe4lS55VKTOOqwpLxClEeU0PQpLDNWSyG4ZQgJXZ3xAZAIwbZk5llUqy6vN3oYeR7ERbE8yaQSt2t0HWQrdZchmnC5lD3N6WCIdBI%2BmPU6ZYFaBo4K7%2B0wxKI6hhqEK3t5w94KCRcYv3YtbXuIndaSAGyPA3FDrw7f%2BJtGPkcFSGXerCv3GcvVpoPO1YJ5H77rbEzRZHB3hMniVkoKthEASptc2r9JvUKKLMqfeyHSFe%2FmOTTk0tfWB5vo0noFHM9VE%2BK22D3NW66i1H2lUbA53uXXw6NYou1UQUIAFXxbfGtfg3RmynHgAnz6AORiOV6HJVVnHLAp6MbnM%3D&X-Amz-Signature=871dfbd99b670d0ed450adb2e71f783906c4319484afe85b3ca8cacbba777e5a&X-Amz-SignedHeaders=host&response-content-disposition=inline" alt="Mail" style="width: 120px; height: auto;" />
            </div>
            
            <!-- 인증 코드 안내 텍스트 -->
            <p style="color: #666666; font-size: 18px; margin: 0 0 30px 0; font-weight: 400;">
              Your verification code is:
            </p>
            
            <!-- 인증 코드 -->
            <div style="margin: 40px 0 50px 0;">
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
