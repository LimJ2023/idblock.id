import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ScanService } from './scan.service';
import {
  GetTransactionsQueryDto,
  GetBlocksQueryDto,
  TransactionListResponseDto,
  TransactionDetailResponseDto,
  BlockListResponseDto,
  BlockDetailResponseDto,
} from './scan.dto';
import { Public } from 'src/auth/auth.guard';

@ApiTags('Blockchain Scan')
@Controller('scan')
export class ScanController {
  constructor(private readonly scanService: ScanService) {}
  
  @Public()
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @Get('transactions')
  @ApiOperation({ 
    summary: '트랜잭션 목록 조회',
    description: '컨트랙트 주소별 트랜잭션 목록을 페이지네이션과 함께 조회합니다.',
  })
  @ApiQuery({
    name: 'contractAddress',
    required: false,
    description: '컨트랙트 주소',
    example: '0x671645FC21615fdcAA332422D5603f1eF9752E03',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '페이지 번호',
    example: '1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '페이지당 항목 수',
    example: '10',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: '정렬 순서',
    enum: ['desc', 'asc'],
    example: 'desc',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description: '커서 기반 페이지네이션을 위한 타임스탬프',
    example: '1640995200',
  })
  @ApiQuery({
    name: 'skipCount',
    required: false,
    description: '전체 카운트 조회 생략 (성능 최적화)',
    example: 'false',
  })
  @ApiResponse({
    status: 200,
    description: '트랜잭션 목록 조회 성공',
    type: TransactionListResponseDto,
  })
  async getTransactions(@Query() query: GetTransactionsQueryDto) {
    return this.scanService.getTransactions(query);
  }

  @Public()
  @Throttle({ default: { limit: 100, ttl: 400000 } })
  @Get('transactions/latest')
  @ApiOperation({
    summary: '최신 트랜잭션 조회 (빠른 조회)',
    description: '최신 트랜잭션을 빠르게 조회합니다. count 쿼리 없이 빠른 응답을 제공합니다.',
  })
  @ApiQuery({
    name: 'contractAddress',
    required: false,
    description: '컨트랙트 주소',
    example: '0x671645FC21615fdcAA332422D5603f1eF9752E03',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '조회할 항목 수',
    example: '10',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: '정렬 순서',
    enum: ['desc', 'asc'],
    example: 'desc',
  })
  @ApiResponse({
    status: 200,
    description: '최신 트랜잭션 조회 성공',
  })
  async getLatestTransactions(@Query() query: { 
    contractAddress?: string; 
    limit?: string; 
    sort?: 'desc' | 'asc' 
  }) {
    return this.scanService.getLatestTransactions(query);
  }

  @Public()
  @Get('transactions/:hash')
  @ApiOperation({
    summary: '트랜잭션 상세 조회',
    description: '트랜잭션 해시로 특정 트랜잭션의 상세 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'hash',
    description: '트랜잭션 해시',
    example: '0x1234567890abcdef...',
  })
  @ApiResponse({
    status: 200,
    description: '트랜잭션 상세 조회 성공',
    type: TransactionDetailResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '트랜잭션을 찾을 수 없음',
  })
  async getTransactionByHash(@Param('hash') hash: string) {
    return this.scanService.getTransactionByHash(hash);
  }

  @Public()
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @Get('blocks')
  @ApiOperation({ 
    summary: '블록 목록 조회',
    description: '블록 목록을 페이지네이션과 함께 조회합니다. 최신 블록이 먼저 표시됩니다.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '페이지 번호',
    example: '1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '페이지당 항목 수',
    example: '10',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: '정렬 순서',
    enum: ['desc', 'asc'],
    example: 'desc',
  })
  @ApiQuery({
    name: 'skipCount',
    required: false,
    description: '전체 카운트 조회 생략 (성능 최적화)',
    example: 'false',
  })
  @ApiResponse({
    status: 200,
    description: '블록 목록 조회 성공',
    type: BlockListResponseDto,
  })
  async getBlocks(@Query() query: GetBlocksQueryDto) {
    return this.scanService.getBlocks(query);
  }

  @Public()
  @Get('blocks/:blockNumber')
  @ApiOperation({
    summary: '블록 정보 조회',
    description: '블록 번호로 특정 블록의 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'blockNumber',
    description: '블록 번호',
    example: '12345',
  })
  @ApiResponse({
    status: 200,
    description: '블록 정보 조회 성공',
    type: BlockDetailResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '블록을 찾을 수 없음',
  })
  async getBlockByNumber(@Param('blockNumber') blockNumber: string) {
    return this.scanService.getBlockByNumber(blockNumber);
  }
} 