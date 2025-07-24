import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BlockTxService } from './block-tx.service';
import {
  GenerateTransactionDto,
  UpdateScheduleDto,
  TransactionLogQueryDto,
} from './block-tx.dto';
import { Public } from 'src/auth/auth.guard';

@ApiTags('Block Transaction')
@Controller('block-tx')
export class BlockTxController {
  constructor(private readonly blockTxService: BlockTxService) {}

  @Public()
  @Post('generate')
  @ApiOperation({
    summary: '수동 트랜잭션 생성',
    description: '지정된 개수만큼 트랜잭션을 즉시 생성합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '트랜잭션 생성 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '50개 트랜잭션 생성이 완료되었습니다.' },
        count: { type: 'number', example: 50 },
        contractAddress: { type: 'string', example: '0x671645FC21615fdcAA332422D5603f1eF9752E03', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  async generateTransactions(@Body() dto: GenerateTransactionDto) {
    try {
      // 간단한 validation
      if (!dto.count || dto.count < 1 || dto.count > 1000) {
        throw new HttpException(
          {
            success: false,
            message: '트랜잭션 개수는 1-1000 사이여야 합니다.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // 컨트랙트 주소 validation
      if (dto.contractAddress && !/^0x[a-fA-F0-9]{40}$/.test(dto.contractAddress)) {
        throw new HttpException(
          {
            success: false,
            message: '유효하지 않은 컨트랙트 주소 형식입니다. (예: 0x1234...)',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.blockTxService.generateManualTransactions(dto.count, dto.contractAddress);
      
      const message = dto.contractAddress 
        ? `${dto.count}개 트랜잭션 생성이 완료되었습니다. (컨트랙트: ${dto.contractAddress})`
        : `${dto.count}개 트랜잭션 생성이 완료되었습니다.`;

      return {
        success: true,
        message,
        count: dto.count,
        contractAddress: dto.contractAddress || null,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: '트랜잭션 생성 중 오류가 발생했습니다.',
          error: error instanceof Error ? error.message : String(error),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Post('generate-single')
  @ApiOperation({
    summary: '단일 랜덤 트랜잭션 생성',
    description: '현재 시각 기준으로 랜덤한 트랜잭션 하나를 즉시 생성합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '단일 트랜잭션 생성 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '단일 랜덤 트랜잭션이 생성되었습니다.' },
        data: {
          type: 'object',
          properties: {
            transaction: {
              type: 'object',
              properties: {
                hash: { type: 'string', example: '0x1234567890abcdef...' },
                blockNumber: { type: 'string', example: '18500001' },
                fromAddress: { type: 'string', example: '0x1234567890123456...' },
                toAddress: { type: 'string', example: '0x9876543210987654...' },
                value: { type: 'string', example: '1000000000000000000' },
                gasPrice: { type: 'string', example: '20000000000' },
                timeStamp: { type: 'string', example: '1704067200' },
              },
            },
            block: {
              type: 'object',
              properties: {
                number: { type: 'string', example: '18500001' },
                hash: { type: 'string', example: '0xabcdef1234567890...' },
                timestamp: { type: 'string', example: '1704067200' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 500, description: '서버 오류' })
  async generateSingleTransaction() {
    try {
      const result = await this.blockTxService.generateSingleRandomTransaction();
      
      return {
        success: true,
        message: '단일 랜덤 트랜잭션이 생성되었습니다.',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '단일 트랜잭션 생성 중 오류가 발생했습니다.',
          error: error instanceof Error ? error.message : String(error),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Put('schedule')
  @ApiOperation({
    summary: '자동 트랜잭션 스케줄 설정 업데이트',
    description: '자동 트랜잭션 생성 스케줄의 설정을 업데이트합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '설정 업데이트 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '스케줄 설정이 업데이트되었습니다.' },
        config: {
          type: 'object',
          properties: {
            minTransactionsPerDay: { type: 'number', example: 100 },
            maxTransactionsPerDay: { type: 'number', example: 200 },
            transactionsPerBlock: { type: 'number', example: 20 },
            enabled: { type: 'boolean', example: true },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  updateSchedule(@Body() dto: UpdateScheduleDto) {
    try {
      // 간단한 validation
      if (dto.minTransactionsPerDay && (dto.minTransactionsPerDay < 10 || dto.minTransactionsPerDay > 10000)) {
        throw new HttpException(
          { success: false, message: '하루 최소 트랜잭션 개수는 10-10000 사이여야 합니다.' },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (dto.maxTransactionsPerDay && (dto.maxTransactionsPerDay < 10 || dto.maxTransactionsPerDay > 10000)) {
        throw new HttpException(
          { success: false, message: '하루 최대 트랜잭션 개수는 10-10000 사이여야 합니다.' },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (dto.transactionsPerBlock && (dto.transactionsPerBlock < 1 || dto.transactionsPerBlock > 100)) {
        throw new HttpException(
          { success: false, message: '블록당 트랜잭션 개수는 1-100 사이여야 합니다.' },
          HttpStatus.BAD_REQUEST,
        );
      }

      this.blockTxService.updateConfiguration(dto);
      const config = this.blockTxService.getConfiguration();
      
      return {
        success: true,
        message: '스케줄 설정이 업데이트되었습니다.',
        config,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: '설정 업데이트 중 오류가 발생했습니다.',
          error: error instanceof Error ? error.message : String(error),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Get('schedule')
  @ApiOperation({
    summary: '현재 스케줄 설정 및 상태 조회',
    description: '자동 트랜잭션 생성 스케줄의 현재 설정과 실행 상태를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '스케줄 상태 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        isRunning: { type: 'boolean', example: true },
        config: {
          type: 'object',
          properties: {
            minTransactionsPerDay: { type: 'number', example: 100 },
            maxTransactionsPerDay: { type: 'number', example: 200 },
            transactionsPerBlock: { type: 'number', example: 20 },
            enabled: { type: 'boolean', example: true },
          },
        },
        nextRun: { type: 'string', example: '2024-01-01T10:00:00.000Z', nullable: true },
      },
    },
  })
  getScheduleStatus() {
    try {
      const status = this.blockTxService.getScheduleStatus();
      
      return {
        success: true,
        ...status,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '스케줄 상태 조회 중 오류가 발생했습니다.',
          error: error instanceof Error ? error.message : String(error),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Post('schedule/start')
  @ApiOperation({
    summary: '자동 트랜잭션 스케줄러 시작',
    description: '자동 트랜잭션 생성 스케줄러를 시작합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '스케줄러 시작 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '자동 트랜잭션 스케줄러가 시작되었습니다.' },
      },
    },
  })
  startScheduler() {
    try {
      this.blockTxService.updateConfiguration({ enabled: true });
      
      return {
        success: true,
        message: '자동 트랜잭션 스케줄러가 시작되었습니다.',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '스케줄러 시작 중 오류가 발생했습니다.',
          error: error instanceof Error ? error.message : String(error),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Post('schedule/stop')
  @ApiOperation({
    summary: '자동 트랜잭션 스케줄러 중지',
    description: '자동 트랜잭션 생성 스케줄러를 중지합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '스케줄러 중지 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '자동 트랜잭션 스케줄러가 중지되었습니다.' },
      },
    },
  })
  stopScheduler() {
    try {
      this.blockTxService.updateConfiguration({ enabled: false });
      
      return {
        success: true,
        message: '자동 트랜잭션 스케줄러가 중지되었습니다.',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '스케줄러 중지 중 오류가 발생했습니다.',
          error: error instanceof Error ? error.message : String(error),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Get('logs')
  @ApiOperation({
    summary: '트랜잭션 생성 로그 조회',
    description: '트랜잭션 생성과 관련된 로그를 페이지별로 조회합니다.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호 (기본값: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지당 로그 수 (기본값: 50)' })
  @ApiQuery({ name: 'date', required: false, type: String, description: '날짜 필터 (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: '로그 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        logs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              timestamp: { type: 'string', example: '2024-01-01T10:00:00.000Z' },
              message: { type: 'string', example: '50개 트랜잭션 생성 완료' },
              level: { type: 'string', enum: ['info', 'warn', 'error'], example: 'info' },
              transactionCount: { type: 'number', example: 50, nullable: true },
              blockCount: { type: 'number', example: 3, nullable: true },
            },
          },
        },
        total: { type: 'number', example: 100 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 50 },
      },
    },
  })
  getLogs(@Query() query: TransactionLogQueryDto) {
    try {
      // 간단한 validation 및 기본값 설정
      const page = query.page ? Math.max(1, Number(query.page)) : 1;
      const limit = query.limit ? Math.min(100, Math.max(1, Number(query.limit))) : 50;
      
      const result = this.blockTxService.getLogs(page, limit, query.date);
      
      return {
        success: true,
        ...result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '로그 조회 중 오류가 발생했습니다.',
          error: error instanceof Error ? error.message : String(error),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Get('stats')
  @ApiOperation({
    summary: '트랜잭션 생성 통계',
    description: '트랜잭션 생성과 관련된 기본 통계 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '통계 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        stats: {
          type: 'object',
          properties: {
            totalLogs: { type: 'number', example: 150 },
            todayLogs: { type: 'number', example: 25 },
            errorLogs: { type: 'number', example: 2 },
            schedulerStatus: { type: 'boolean', example: true },
            lastActivity: { type: 'string', example: '2024-01-01T10:00:00.000Z', nullable: true },
          },
        },
      },
    },
  })
  getStats() {
    try {
      const logs = this.blockTxService.getLogs(1, 1000); // 모든 로그 가져오기
      const today = new Date().toDateString();
      const todayLogs = logs.logs.filter(log => 
        new Date(log.timestamp).toDateString() === today
      );
      const errorLogs = logs.logs.filter(log => log.level === 'error');
      const scheduleStatus = this.blockTxService.getScheduleStatus();

      return {
        success: true,
        stats: {
          totalLogs: logs.total,
          todayLogs: todayLogs.length,
          errorLogs: errorLogs.length,
          schedulerStatus: scheduleStatus.isRunning,
          lastActivity: logs.logs.length > 0 ? logs.logs[0].timestamp : null,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '통계 조회 중 오류가 발생했습니다.',
          error: error instanceof Error ? error.message : String(error),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 