import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ExternalApiKeyService } from './api-key.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeyService: ExternalApiKeyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    if (!apiKey) throw new UnauthorizedException('API Key가 필요합니다.');

    const isValid = await this.apiKeyService.validateApiKey(apiKey);
    if (!isValid) throw new UnauthorizedException('유효하지 않은 API Key입니다.');
    return true;
  }
} 