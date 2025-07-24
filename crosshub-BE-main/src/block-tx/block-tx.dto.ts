import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateTransactionDto {
  @ApiProperty({
    description: '생성할 트랜잭션 개수',
    example: 50,
    minimum: 1,
    maximum: 1000,
  })
  count: number;

  @ApiPropertyOptional({
    description: '트랜잭션을 생성할 컨트랙트 주소 (선택사항, 미지정시 랜덤 선택)',
    example: '0x671645FC21615fdcAA332422D5603f1eF9752E03',
    pattern: '^0x[a-fA-F0-9]{40}$',
  })
  contractAddress?: string;
}

export class UpdateScheduleDto {
  @ApiPropertyOptional({
    description: '하루 최소 트랜잭션 개수',
    example: 100,
    minimum: 10,
    maximum: 10000,
  })
  minTransactionsPerDay?: number;

  @ApiPropertyOptional({
    description: '하루 최대 트랜잭션 개수',
    example: 200,
    minimum: 10,
    maximum: 10000,
  })
  maxTransactionsPerDay?: number;

  @ApiPropertyOptional({
    description: '블록당 평균 트랜잭션 개수',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  transactionsPerBlock?: number;

  @ApiPropertyOptional({
    description: '자동 생성 활성화 여부',
    example: true,
  })
  enabled?: boolean;
}

export class TransactionLogQueryDto {
  @ApiPropertyOptional({
    description: '페이지 번호',
    example: 1,
    minimum: 1,
  })
  page?: number = 1;

  @ApiPropertyOptional({
    description: '페이지당 로그 수',
    example: 50,
    minimum: 1,
    maximum: 100,
  })
  limit?: number = 50;

  @ApiPropertyOptional({
    description: '날짜 필터 (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  date?: string;
}

export interface TransactionGeneratorConfig {
  minTransactionsPerDay: number;
  maxTransactionsPerDay: number;
  transactionsPerBlock: number;
  enabled: boolean;
}

export interface TransactionLog {
  timestamp: Date;
  message: string;
  level: 'info' | 'warn' | 'error';
  transactionCount?: number;
  blockCount?: number;
} 