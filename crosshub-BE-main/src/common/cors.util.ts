import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

/**
 * CORS 보안 유틸리티
 */
export class CorsUtil {
  /**
   * 도메인 검증 - 화이트리스트 방식
   */
  static validateOrigin(origin: string | undefined, allowedOrigins: string[]): boolean {
    if (!origin) return true; // 같은 도메인에서의 요청 (브라우저가 Origin 헤더를 보내지 않음)
    
    return allowedOrigins.some(allowedOrigin => {
      // 정확한 도메인 매칭
      if (allowedOrigin === origin) return true;
      
      // 서브도메인 허용 (예: *.example.com)
      if (allowedOrigin.startsWith('*.')) {
        const domain = allowedOrigin.substring(2);
        return origin.endsWith(domain);
      }
      
      return false;
    });
  }

  /**
   * 개발 환경 도메인 검증
   */
  static isDevOrigin(origin: string | undefined): boolean {
    if (!origin) return true;
    
    const devPatterns = [
      /^https?:\/\/localhost(:\d+)?$/,
      /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
      /^https?:\/\/0\.0\.0\.0(:\d+)?$/,
      /^https?:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/, // 내부 네트워크
      /^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/, // 로컬 네트워크
    ];
    
    return devPatterns.some(pattern => pattern.test(origin));
  }

  /**
   * 안전한 CORS 설정 생성
   */
  static createSafeCorsConfig(
    allowedOrigins: string[],
    credentials: boolean = false,
    isDevelopment: boolean = false,
  ): CorsOptions {
    return {
      origin: (origin, callback) => {
        // 개발 환경에서는 개발 도메인 추가 허용
        if (isDevelopment && CorsUtil.isDevOrigin(origin)) {
          return callback(null, true);
        }

        // 허용된 도메인 검증
        if (CorsUtil.validateOrigin(origin, allowedOrigins)) {
          return callback(null, true);
        }

        // 보안 로그 (프로덕션에서는 주의깊게 사용)
        if (process.env.NODE_ENV === 'development') {
          console.warn(`CORS blocked origin: ${origin}`);
        }

        callback(new Error('Not allowed by CORS'));
      },
      credentials,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'x-api-key',
        'Accept',
        'Origin',
        'X-Requested-With',
      ],
      exposedHeaders: ['Set-Cookie'],
      maxAge: 86400, // 24시간 preflight 캐시
      optionsSuccessStatus: 200, // IE11 지원
    };
  }
} 