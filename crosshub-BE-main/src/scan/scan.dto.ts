import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetTransactionsQueryDto {
  @ApiPropertyOptional({
    description: '컨트랙트 주소',
    example: '0x671645FC21615fdcAA332422D5603f1eF9752E03',
  })
  contractAddress?: string;

  @ApiPropertyOptional({
    description: '페이지 번호',
    example: '1',
    default: '1',
  })
  page?: string = '1';

  @ApiPropertyOptional({
    description: '페이지당 항목 수',
    example: '10',
    default: '10',
  })
  limit?: string = '10';

  @ApiPropertyOptional({
    description: '정렬 순서',
    example: 'desc',
    default: 'desc',
    enum: ['desc', 'asc'],
  })
  sort?: 'desc' | 'asc' = 'desc';

  @ApiPropertyOptional({
    description: '커서 기반 페이지네이션을 위한 타임스탬프 커서',
    example: '1640995200',
  })
  cursor?: string;

  @ApiPropertyOptional({
    description: '전체 카운트 조회 생략 여부 (성능 최적화)',
    example: 'true',
    default: 'true',
  })
  skipCount?: boolean = true;
}

export class GetMultiContractStatsQueryDto {
  @ApiProperty({
    description: '컨트랙트 주소 배열 (최대 10개)',
    example: ['0x671645FC21615fdcAA332422D5603f1eF9752E03', '0x123...', '0x456...'],
    type: [String],
  })
  contractAddresses: string[];

  @ApiPropertyOptional({
    description: '캐시 사용 여부',
    example: true,
    default: true,
  })
  useCache?: boolean = true;
}

export class ContractStatsResponseDto {
  @ApiProperty()
  contractAddress: string;

  @ApiProperty()
  transactionCount: number;

  @ApiProperty({ required: false })
  error?: string;
}

export class MultiContractStatsResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ type: [ContractStatsResponseDto] })
  data: ContractStatsResponseDto[];

  @ApiProperty()
  totalTransactions: number;

  @ApiProperty({
    description: '캐시에서 가져온 결과 여부',
  })
  fromCache: boolean;

  @ApiProperty({
    description: '응답 시간 (ms)',
  })
  responseTime: number;
}

export class TransactionResponseDto {
  @ApiProperty()
  id: bigint;

  @ApiProperty()
  blockNumber: string;

  @ApiProperty()
  timeStamp: string;

  @ApiProperty()
  hash: string;

  @ApiProperty({ required: false })
  nonce?: string;

  @ApiProperty({ required: false })
  blockHash?: string;

  @ApiProperty({ required: false })
  transactionIndex?: string;

  @ApiProperty()
  fromAddress: string;

  @ApiProperty({ required: false })
  toAddress?: string;

  @ApiProperty({ required: false })
  value?: string;

  @ApiProperty({ required: false })
  gas?: string;

  @ApiProperty({ required: false })
  gasPrice?: string;

  @ApiProperty({ required: false })
  isError?: string;

  @ApiProperty({ required: false })
  txreceiptStatus?: string;

  @ApiProperty({ required: false })
  input?: string;

  @ApiProperty({ required: false })
  contractAddress?: string;

  @ApiProperty({ required: false })
  cumulativeGasUsed?: string;

  @ApiProperty({ required: false })
  gasUsed?: string;

  @ApiProperty({ required: false })
  confirmations?: string;

  @ApiProperty({ required: false })
  methodId?: string;

  @ApiProperty({ required: false })
  functionName?: string;

  @ApiProperty({ 
    description: '생성일시',
    example: '2025-06-23T08:18:24.275Z'
  })
  createdAt: string;

  @ApiProperty({ 
    description: '수정일시',
    example: '2025-06-23T08:18:24.275Z'
  })
  updatedAt: string;
}

export class TransactionListResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ type: [TransactionResponseDto] })
  data: TransactionResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

export class TransactionDetailResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ type: TransactionResponseDto })
  data: TransactionResponseDto;
}

export class BlockResponseDto {
  @ApiProperty()
  id: bigint;

  @ApiProperty()
  number: string;

  @ApiProperty()
  hash: string;

  @ApiProperty({ required: false })
  parentHash?: string;

  @ApiProperty({ required: false })
  miner?: string;

  @ApiProperty()
  timestamp: string;

  @ApiProperty({ required: false })
  gasLimit?: string;

  @ApiProperty({ required: false })
  gasUsed?: string;

  @ApiProperty({ required: false })
  size?: string;

  @ApiProperty({ 
    description: '생성일시',
    example: '2025-06-23T08:18:24.275Z'
  })
  createdAt: string;

  @ApiProperty({ 
    description: '수정일시',
    example: '2025-06-23T08:18:24.275Z'
  })
  updatedAt: string;
}

export class GetBlocksQueryDto {
  @ApiPropertyOptional({
    description: '페이지 번호',
    example: '1',
    default: '1',
  })
  page?: string = '1';

  @ApiPropertyOptional({
    description: '페이지당 항목 수',
    example: '10',
    default: '10',
  })
  limit?: string = '10';

  @ApiPropertyOptional({
    description: '정렬 순서',
    example: 'desc',
    default: 'desc',
    enum: ['desc', 'asc'],
  })
  sort?: 'desc' | 'asc' = 'desc';

  @ApiPropertyOptional({
    description: '전체 카운트 조회 생략 여부 (성능 최적화)',
    example: 'true',
    default: 'true',
  })
  skipCount?: boolean = true;
}

export class BlockListResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ type: [BlockResponseDto] })
  data: BlockResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

export class BlockDetailResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ type: BlockResponseDto })
  data: BlockResponseDto;
} 