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
    example: '100',
    default: '100',
  })
  limit?: string = '100';

  @ApiPropertyOptional({
    description: '정렬 순서',
    example: 'desc',
    default: 'desc',
    enum: ['desc', 'asc'],
  })
  sort?: 'desc' | 'asc' = 'desc';
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

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
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

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class BlockDetailResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ type: BlockResponseDto })
  data: BlockResponseDto;
} 