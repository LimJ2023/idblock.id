import { Global, Module } from '@nestjs/common';
import { EnvService } from './env.service';
import { ConfigModule } from '@nestjs/config';
import { EnvSchema } from './env.schema';
import * as v from 'valibot';
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => {
        return v.parse(EnvSchema, env);
      },
    }),
  ],
  providers: [EnvService],
  exports: [EnvService],
})
export class EnvModule {}
