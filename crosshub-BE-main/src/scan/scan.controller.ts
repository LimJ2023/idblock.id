import { Controller, Get, Param, Query, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ScanService } from './scan.service';
import {
  GetTransactionsQueryDto,
  GetBlocksQueryDto,
  TransactionListResponseDto,
  TransactionDetailResponseDto,
  BlockListResponseDto,
  BlockDetailResponseDto,
  GetMultiContractStatsQueryDto,
  MultiContractStatsResponseDto,
} from './scan.dto';
import { Public } from 'src/auth/auth.guard';

@ApiTags('Blockchain Scan')
@Controller('scan')
export class ScanController {
  constructor(private readonly scanService: ScanService) {}
  
  @Public()
  @Throttle({ default: { limit: 100, ttl: 400000 } })
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
  @Get('debug/transaction-count')
  @ApiOperation({ 
    summary: '디버깅: 트랜잭션 총 개수 확인',
    description: '데이터베이스에 있는 트랜잭션의 총 개수를 확인합니다.',
  })
  @ApiQuery({
    name: 'contractAddress',
    required: false,
    description: '컨트랙트 주소 (선택사항)',
    example: '0x671645FC21615fdcAA332422D5603f1eF9752E03',
  })
  async getTransactionCount(@Query() query: { contractAddress?: string }) {
    return this.scanService.getTransactionCount(query.contractAddress);
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
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  @Post('contracts/stats')
  @ApiOperation({ 
    summary: '다중 컨트랙트 트랜잭션 통계 조회',
    description: '여러 컨트랙트 주소의 트랜잭션 개수를 한 번에 조회합니다. 캐싱을 통해 빠른 응답을 제공합니다.',
  })
  @ApiBody({
    type: GetMultiContractStatsQueryDto,
    description: '조회할 컨트랙트 주소 목록',
    examples: {
      threeContracts: {
        summary: '3개 컨트랙트 조회',
        value: {
          contractAddresses: [
            '0x671645FC21615fdcAA332422D5603f1eF9752E03',
            '0x123456789abcdef123456789abcdef1234567890',
            '0xabcdef123456789abcdef123456789abcdef1234'
          ],
          useCache: true
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: '다중 컨트랙트 통계 조회 성공',
    type: MultiContractStatsResponseDto,
  })
  async getMultiContractStats(@Body() body: GetMultiContractStatsQueryDto) {
    return this.scanService.getMultiContractStats(body);
  }

  @Public()
  @Throttle({ default: { limit: 100, ttl: 400000 } })
  @Post('contracts/stats/fast')
  @ApiOperation({ 
    summary: '다중 컨트랙트 통계 조회 (초고속)',
    description: '통계 테이블을 사용하여 초고속으로 컨트랙트 통계를 조회합니다. 실시간 데이터가 아닐 수 있습니다.',
  })
  @ApiBody({
    type: [String],
    description: '조회할 컨트랙트 주소 배열',
    examples: {
      threeContracts: {
        summary: '3개 컨트랙트 초고속 조회',
        value: [
          '0x671645FC21615fdcAA332422D5603f1eF9752E03',
          '0x123456789abcdef123456789abcdef1234567890',
          '0xabcdef123456789abcdef123456789abcdef1234'
        ]
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: '초고속 통계 조회 성공',
  })
  async getFastContractStats(@Body() contractAddresses: string[]) {
    return this.scanService.getMultiContractStatsFromTable(contractAddresses);
  }

  @Public()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post('contracts/stats/approximate')
  @ApiOperation({ 
    summary: '다중 컨트랙트 근사 통계 조회 (초고속)',
    description: '매우 큰 테이블에서 근사치를 사용해 초고속으로 통계를 조회합니다.',
  })
  @ApiBody({
    type: [String],
    description: '조회할 컨트랙트 주소 배열',
  })
  @ApiResponse({
    status: 200,
    description: '근사 통계 조회 성공',
  })
  async getApproximateStats(@Body() contractAddresses: string[]) {
    return this.scanService.getApproximateMultiContractStats(contractAddresses);
  }

  @Public()
  @Post('contracts/stats/update')
  @ApiOperation({ 
    summary: '컨트랙트 통계 업데이트',
    description: '특정 컨트랙트들의 통계를 수동으로 업데이트합니다.',
  })
  @ApiBody({
    type: [String],
    required: false,
    description: '업데이트할 컨트랙트 주소 배열 (빈 배열이면 전체 업데이트)',
  })
  @ApiResponse({
    status: 200,
    description: '통계 업데이트 성공',
  })
  async updateContractStats(@Body() contractAddresses?: string[]) {
    return this.scanService.updateContractStats(contractAddresses);
  }

  @Public()
  @Get('cache/status')
  @ApiOperation({ 
    summary: '캐시 상태 조회',
    description: '통계 캐시의 현재 상태를 조회합니다.',
  })
  async getCacheStatus() {
    return this.scanService.getCacheStatus();
  }

  @Public()
  @Post('cache/clear')
  @ApiOperation({ 
    summary: '캐시 초기화',
    description: '통계 캐시를 수동으로 초기화합니다.',
  })
  async clearCache() {
    this.scanService.clearStatsCache();
    return { success: true, message: '캐시가 초기화되었습니다.' };
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