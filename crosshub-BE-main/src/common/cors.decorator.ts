import { SetMetadata } from '@nestjs/common';

export const CORS_ORIGINS_KEY = 'cors_origins';

/**
 * 특정 엔드포인트에 대한 CORS 설정
 */
export const CorsOrigins = (origins: string[]) => 
  SetMetadata(CORS_ORIGINS_KEY, origins);

/**
 * 민감한 API 엔드포인트 (더 엄격한 CORS)
 */
export const StrictCors = (origins: string[]) => 
  SetMetadata(CORS_ORIGINS_KEY, origins);

/**
 * 공개 API 엔드포인트 (모든 도메인 허용)
 */
export const PublicCors = () => 
  SetMetadata(CORS_ORIGINS_KEY, ['*']); 