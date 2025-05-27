import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConditionalModule, ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { EnvModule } from './env/env.module';
import { AuthModule } from './auth/auth.module';
import { AdminAuthModule } from './admin-auth/admin-auth.module';
import { TEnv } from './env/env.schema';
import { JwtModule } from '@nestjs/jwt';
import { EnvService } from './env/env.service';
import { S3Module } from './s3/s3.module';
import { FirebaseModule } from './firebase/firebase.module';
import { EmailModule } from './email/email.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { CommonModule } from './common/common.module';
import { AuthGuard } from './auth/auth.guard';
import { ManagerAuthModule } from './manager-auth/manager-auth.module';
import { SiteModule } from './site/site.module';
import { UserModule } from './user/user.module';
import { NotificationModule } from './notification/notification.module';
import { ThirdwebModule } from './thirdweb/thirdweb.module';
import { TmpEslModule } from './tmp-esl/tmp-esl.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { VisitorModule } from './visitor/visitor.module';
import { ReviewModule } from './review/review.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      global: true,
      imports: [EnvModule],
      useFactory: async (envService: EnvService) => {
        return {
          secret: envService.get<string>('JWT_SECRET'),
          global: true,
          signOptions: {
            expiresIn: '1w',
          },
        };
      },

      inject: [EnvService],
    }),
    ConditionalModule.registerWhen(
      ServeStaticModule.forRoot({
        rootPath: join(__dirname, '../', 'admin-fe'),
      }),
      (env: NodeJS.ProcessEnv) =>
        (env as unknown as TEnv).API_SCOPE === 'ADMIN',
    ),
    ConditionalModule.registerWhen(
      ServeStaticModule.forRoot({
        rootPath: join(__dirname, '../', 'manager-fe'),
      }),
      (env: NodeJS.ProcessEnv) =>
        (env as unknown as TEnv).API_SCOPE === 'MANAGER',
    ),
    DatabaseModule,
    EnvModule,
    S3Module,
    FirebaseModule,
    EmailModule,
    ConditionalModule.registerWhen(
      AuthModule,
      (env: NodeJS.ProcessEnv) =>
        (env as unknown as TEnv).API_SCOPE === 'PUBLIC',
    ),
    ConditionalModule.registerWhen(
      AdminAuthModule,
      (env: NodeJS.ProcessEnv) =>
        (env as unknown as TEnv).API_SCOPE === 'ADMIN',
    ),
    ConditionalModule.registerWhen(
      ManagerAuthModule,
      (env: NodeJS.ProcessEnv) =>
        (env as unknown as TEnv).API_SCOPE === 'MANAGER',
    ),
    CommonModule,
    SiteModule,
    UserModule,
    NotificationModule,
    ThirdwebModule,
    TmpEslModule,
    ConditionalModule.registerWhen(
      VisitorModule,
      (env: NodeJS.ProcessEnv) =>
        (env as unknown as TEnv).API_SCOPE === 'MANAGER',
    ),
    ConditionalModule.registerWhen(
      ReviewModule,
      (env: NodeJS.ProcessEnv) =>
        (env as unknown as TEnv).API_SCOPE === 'MANAGER',
    ),
  ],
  controllers:
    (process.env as unknown as TEnv).API_SCOPE === 'PUBLIC' ? [AppController]
    : (process.env as unknown as TEnv).API_SCOPE === 'ADMIN' ? []
    : (process.env as unknown as TEnv).API_SCOPE === 'MANAGER' ? []
    : [],

  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
