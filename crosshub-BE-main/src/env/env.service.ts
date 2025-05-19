import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TEnv } from './env.schema';

@Injectable()
export class EnvService extends ConfigService<TEnv, true> {}
