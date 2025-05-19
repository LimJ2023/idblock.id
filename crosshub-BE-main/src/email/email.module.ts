import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ResendEmailService } from './resend.email.service';
import { AwsSesEmailService } from './aws-ses.email.service';
import { ResendProvider } from './resend-provider';
import { TEnv } from 'src/env/env.schema';
import { SesProvider } from './ses-provider';

@Module({
  providers: [
    {
      provide: EmailService,
      useClass:
        (
          (process.env.STAGE as TEnv['STAGE']) === 'LOCAL' ||
          (process.env.STAGE as TEnv['STAGE']) === 'DEVELOPMENT'
        ) ?
          ResendEmailService
        : ResendEmailService,
      // AwsSesEmailService
      // : AwsSesEmailService,
    },
    ResendProvider,
    SesProvider,
  ],
  exports: [EmailService],
})
export class EmailModule {}
