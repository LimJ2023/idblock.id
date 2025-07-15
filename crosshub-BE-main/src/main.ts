import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { RequestMethod, VERSION_NEUTRAL, VersioningType } from '@nestjs/common';
import metadata from './metadata';
import { ValidationPipe } from './lib/typeschema';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { EnvService } from './env/env.service';
import { CorsUtil } from './common/cors.util';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose', 'fatal'],
  });

  // 환경 변수 서비스 가져오기
  const envService = app.get(EnvService);
  
  const config = new DocumentBuilder()
    .setTitle('Crosshub API')
    .setDescription('Crosshub API')
    .setVersion('1.0')
    .addCookieAuth('access_token')
    .addBearerAuth()
    .build();

  // 안전한 CORS 설정
  const corsOrigins = envService.get('CORS_ORIGINS');
  const corsCredentials = envService.get('CORS_CREDENTIALS');
  const isDevelopment = process.env.NODE_ENV === 'development';

  const corsConfig = CorsUtil.createSafeCorsConfig(
    corsOrigins,
    corsCredentials,
    isDevelopment,
  );

  app.enableCors(corsConfig);

  app.use(cookieParser());
  app.setGlobalPrefix('api', {
    exclude: [
      { path: '/', method: RequestMethod.GET, version: VERSION_NEUTRAL },
    ],
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1'],
  });

  app.useGlobalPipes(new ValidationPipe());

  // app.useStaticAssets(join(__dirname, '..', 'public'));
  // app.setBaseViewsDir(join(__dirname, '..', 'views'));
  // docker 환경에서는 절대 경로로 설정
  app.useStaticAssets(join(__dirname, '../public'));
  app.setBaseViewsDir(join(__dirname, '../views'));
  app.setViewEngine('hbs');

  await SwaggerModule.loadPluginMetadata(metadata); // <-- here
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger', app, document, {
    explorer: true,
    customSiteTitle: 'Crosshub API',
  });
  app.use(
    '/scalar',
    apiReference({
      cdn: 'https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.25.66',
      theme: 'solarized',
      spec: {
        content: document,
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
