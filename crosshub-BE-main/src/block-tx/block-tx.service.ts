import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Transaction, Block } from '../database/schema';
import { desc } from 'drizzle-orm';
import { TransactionGeneratorConfig, TransactionLog } from './block-tx.dto';
import { INJECT_DRIZZLE, DrizzleDB } from '../database/drizzle.provider';
import * as schedule from 'node-schedule';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BlockTxService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BlockTxService.name);
  private scheduledJob: schedule.Job | null = null;
  private logs: TransactionLog[] = [];
  private readonly maxLogEntries = 1000;
  
  // 설정값들
  private config: TransactionGeneratorConfig = {
    minTransactionsPerDay: 100,
    maxTransactionsPerDay: 200,
    transactionsPerBlock: 20,
    enabled: false,
  };

  // 컨트랙트 주소 풀
  private readonly contractAddresses = [
    '0x671645FC21615fdcAA332422D5603f1eF9752E03',
    '0xA0b86a33E6441E8F2C2b4A4E5a9e24B4b6e2A5F4', // USDC
    '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
    '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
    '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', // MATIC
    '0x514910771AF9Ca656af840dff83E8264EcF986CA', // LINK
  ];

  private readonly functionNames = [
    'transfer',
    'approve',
    'transferFrom',
    'mint',
    'burn',
    'swap',
    'stake',
    'unstake',
    'claim',
  ];

  constructor(@Inject(INJECT_DRIZZLE) private db: DrizzleDB) {}

  async onModuleInit() {
    this.logger.log('🚀 BlockTx 서비스 초기화');
    this.loadConfiguration();
    if (this.config.enabled) {
      this.startScheduler();
    }
  }

  async onModuleDestroy() {
    if (this.scheduledJob) {
      this.scheduledJob.cancel();
    }
    this.logger.log('💥 BlockTx 서비스 종료');
  }

  // 설정 로드 (실제 프로덕션에서는 DB나 config 파일에서 로드)
  private loadConfiguration() {
    // 환경변수 또는 DB에서 설정 로드
    const envConfig = {
      minTransactionsPerDay: parseInt(process.env.MIN_TRANSACTIONS_PER_DAY || '100'),
      maxTransactionsPerDay: parseInt(process.env.MAX_TRANSACTIONS_PER_DAY || '200'),
      transactionsPerBlock: parseInt(process.env.TRANSACTIONS_PER_BLOCK || '20'),
      enabled: process.env.AUTO_TRANSACTION_ENABLED === 'true',
    };

    this.config = { ...this.config, ...envConfig };
    this.addLog('info', `설정 로드 완료: ${JSON.stringify(this.config)}`);
  }

  // 로그 추가
  private addLog(level: 'info' | 'warn' | 'error', message: string, transactionCount?: number, blockCount?: number) {
    const logEntry: TransactionLog = {
      timestamp: new Date(),
      message,
      level,
      transactionCount,
      blockCount,
    };

    this.logs.unshift(logEntry);
    
    // 최대 로그 수 제한
    if (this.logs.length > this.maxLogEntries) {
      this.logs = this.logs.slice(0, this.maxLogEntries);
    }

    // 콘솔 출력
    this.logger.log(message, level);
  }

  // 유틸리티 함수들
  private generateRandomHash(): string {
    return '0x' + crypto.randomBytes(32).toString('hex');
  }

  private generateRandomAddress(): string {
    return '0x' + crypto.randomBytes(20).toString('hex');
  }

  private generateRandomValue(): string {
    const ethAmount = Math.random() * 9.999 + 0.001; // 0.001 ~ 10 ETH
    const weiAmount = Math.floor(ethAmount * 1e18);
    return weiAmount.toString();
  }

  private generateGasValues() {
    const gasLimit = Math.floor(Math.random() * 300000) + 21000; // 21k ~ 321k
    const gasUsed = Math.floor(gasLimit * (0.7 + Math.random() * 0.3)); // 70% ~ 100% 사용
    const gasPrice = Math.floor(Math.random() * 50) + 20; // 20 ~ 70 Gwei
    
    return {
      gas: gasLimit.toString(),
      gasUsed: gasUsed.toString(),
      gasPrice: (gasPrice * 1e9).toString(),
    };
  }

  // 현재 최신 블록 번호 조회
  private async getLatestBlockNumber(): Promise<number> {
    try {
      const result = await this.db
        .select({ number: Block.number })
        .from(Block)
        .orderBy(desc(Block.number))
        .limit(1);
        
      if (result.length === 0) {
        return 18500000; // 기본 시작 블록
      }
      
      return parseInt(result[0].number) + 1;
    } catch (error) {
      this.addLog('warn', `블록 조회 중 오류, 기본값 사용: ${error}`);
      return 18500000;
    }
  }

  // 블록 데이터 생성
  private generateBlockData(blockNumber: number, timestamp: Date): typeof Block.$inferInsert {
    const gasUsed = Math.floor(Math.random() * 5000000) + 1000000; // 1M ~ 6M
    const gasLimit = gasUsed + Math.floor(Math.random() * 2000000);
    
    return {
      number: blockNumber.toString(),
      hash: this.generateRandomHash(),
      parentHash: this.generateRandomHash(),
      miner: this.generateRandomAddress(),
      timestamp: Math.floor(timestamp.getTime() / 1000).toString(),
      gasLimit: gasLimit.toString(),
      gasUsed: gasUsed.toString(),
      size: (Math.floor(Math.random() * 50000) + 20000).toString(),
    };
  }

  // 트랜잭션 데이터 생성
  private generateTransactionData(
    blockNumber: number,
    blockHash: string,
    transactionIndex: number,
    timestamp: Date
  ): typeof Transaction.$inferInsert {
    const gasValues = this.generateGasValues();
    const isContractInteraction = Math.random() < 0.4; // 40% 확률로 컨트랙트 상호작용
    const isError = Math.random() < 0.01; // 1% 확률로 에러
    
    const contractAddress = isContractInteraction ? 
      this.contractAddresses[Math.floor(Math.random() * this.contractAddresses.length)] : 
      null;
      
    const functionName = isContractInteraction ? 
      this.functionNames[Math.floor(Math.random() * this.functionNames.length)] : 
      null;
    
    return {
      blockNumber: blockNumber.toString(),
      timeStamp: Math.floor(timestamp.getTime() / 1000).toString(),
      hash: this.generateRandomHash(),
      nonce: Math.floor(Math.random() * 100000).toString(),
      blockHash: blockHash,
      transactionIndex: transactionIndex.toString(),
      fromAddress: this.generateRandomAddress(),
    //   toAddress: contractAddress || this.generateRandomAddress(),
      toAddress: "0x671645FC21615fdcAA332422D5603f1eF9752E03",
      value: this.generateRandomValue(),
      gas: gasValues.gas,
      gasPrice: gasValues.gasPrice,
      isError: isError ? '1' : '0',
      txreceiptStatus: isError ? '0' : '1',
      input: isContractInteraction ? '0x' + crypto.randomBytes(25).toString('hex') : '0x',
    //   contractAddress: contractAddress,
      contractAddress: "0x671645FC21615fdcAA332422D5603f1eF9752E03",
      cumulativeGasUsed: gasValues.gasUsed,
      gasUsed: gasValues.gasUsed,
      confirmations: Math.floor(Math.random() * 100).toString(),
      methodId: isContractInteraction ? '0x' + crypto.randomBytes(4).toString('hex') : null,
      functionName: functionName,
    };
  }

  // 배치 생성 및 삽입
  async generateAndInsertBatch(count: number): Promise<void> {
    const blocks: (typeof Block.$inferInsert)[] = [];
    const transactions: (typeof Transaction.$inferInsert)[] = [];
    
    let blockNumber = await this.getLatestBlockNumber();
    const now = new Date();
    
    let transactionIndex = 0;
    let currentBlockTxCount = 0;
    let currentBlockHash = this.generateRandomHash();
    
    // 첫 번째 블록 생성
    blocks.push(this.generateBlockData(blockNumber, now));
    
    for (let i = 0; i < count; i++) {
      // 블록당 트랜잭션 수 초과시 새 블록 생성
      if (currentBlockTxCount >= this.config.transactionsPerBlock) {
        blockNumber++;
        currentBlockHash = this.generateRandomHash();
        currentBlockTxCount = 0;
        transactionIndex = 0;
        
        // 새 블록 시간은 1-3분 후로 설정
        const blockTime = new Date(now.getTime() + Math.random() * 2 * 60 * 1000 + 60 * 1000);
        blocks.push(this.generateBlockData(blockNumber, blockTime));
      }
      
      // 트랜잭션 시간을 현재 시간 기준으로 약간 랜덤화
      const txTime = new Date(now.getTime() + Math.random() * 60 * 1000);
      
      transactions.push(this.generateTransactionData(
        blockNumber,
        currentBlockHash,
        transactionIndex,
        txTime
      ));
      
      currentBlockTxCount++;
      transactionIndex++;
    }
    
    try {
      // 블록 먼저 삽입
      if (blocks.length > 0) {
        await this.db.insert(Block).values(blocks).onConflictDoNothing();
      }
      
      // 트랜잭션 삽입
      if (transactions.length > 0) {
        await this.db.insert(Transaction).values(transactions).onConflictDoNothing();
      }
      
      this.addLog('info', `${count}개 트랜잭션 생성 완료`, count, blocks.length);
    } catch (error) {
      this.addLog('error', `데이터 삽입 중 오류: ${error}`);
      throw error;
    }
  }

  // 하루 동안의 트랜잭션 생성 계획
  private generateDayPlan(): number[] {
    const totalTransactions = Math.floor(
      Math.random() * (this.config.maxTransactionsPerDay - this.config.minTransactionsPerDay) + 
      this.config.minTransactionsPerDay
    );
    
    // 하루를 24시간으로 나누고 각 시간대별로 트랜잭션 분배
    const hourlyDistribution: number[] = new Array(24).fill(0);
    
    for (let i = 0; i < totalTransactions; i++) {
      // 가중치: 업무시간(9-18시)에 더 많은 트랜잭션
      const weights = [
        0.5, 0.3, 0.2, 0.2, 0.3, 0.5, // 0-5시
        0.8, 1.2, 1.5, 2.0, 2.5, 3.0, // 6-11시
        3.5, 3.0, 2.8, 2.5, 2.2, 1.8, // 12-17시
        1.5, 1.2, 1.0, 0.8, 0.6, 0.5  // 18-23시
      ];
      
      // 가중치 기반 시간대 선택
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      let random = Math.random() * totalWeight;
      
      for (let hour = 0; hour < 24; hour++) {
        random -= weights[hour];
        if (random <= 0) {
          hourlyDistribution[hour]++;
          break;
        }
      }
    }
    
    return hourlyDistribution;
  }

  // 스케줄러 시작
  startScheduler() {
    if (this.scheduledJob) {
      this.scheduledJob.cancel();
    }

    // 매시간 00분에 실행
    this.scheduledJob = schedule.scheduleJob('0 * * * *', async () => {
      if (!this.config.enabled) return;

      try {
        const dayPlan = this.generateDayPlan();
        const currentHour = new Date().getHours();
        const transactionsForThisHour = dayPlan[currentHour];

        if (transactionsForThisHour > 0) {
          this.addLog('info', `${currentHour}시: ${transactionsForThisHour}개 트랜잭션 생성 시작`);
          
          // 시간 내에서 불규칙적으로 분산 생성
          await this.generateTransactionsForHour(transactionsForThisHour);
          
          this.addLog('info', `${currentHour}시 완료`);
        }
      } catch (error) {
        this.addLog('error', `스케줄 실행 중 오류: ${error}`);
      }
    });

    this.addLog('info', '자동 트랜잭션 스케줄러 시작됨');
  }

  // 시간별 트랜잭션 생성 함수
  private async generateTransactionsForHour(count: number): Promise<void> {
    if (count === 0) return;
    
    // 1-5개 트랜잭션을 여러 번 생성
    const batches = Math.ceil(count / 5);
    
    for (let i = 0; i < batches; i++) {
      const batchSize = Math.min(5, count - i * 5);
      if (batchSize > 0) {
        await this.generateAndInsertBatch(batchSize);
        
        // 배치 간 지연 (1-10분)
        if (i < batches - 1) {
          const delay = Math.floor(Math.random() * 10 * 60 * 1000) + 60 * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
  }

  // 스케줄러 중지
  stopScheduler() {
    if (this.scheduledJob) {
      this.scheduledJob.cancel();
      this.scheduledJob = null;
      this.addLog('info', '자동 트랜잭션 스케줄러 중지됨');
    }
  }

  // 수동 트랜잭션 생성
  async generateManualTransactions(count: number): Promise<void> {
    this.addLog('info', `수동으로 ${count}개 트랜잭션 생성 시작`);
    await this.generateAndInsertBatch(count);
    this.addLog('info', `수동 트랜잭션 생성 완료`);
  }

  // 현재 시각 기준 단일 랜덤 트랜잭션 생성
  async generateSingleRandomTransaction(): Promise<{ transaction: any, block: any }> {
    const now = new Date();
    const blockNumber = await this.getLatestBlockNumber();
    
    this.addLog('info', `블록 ${blockNumber}에 단일 랜덤 트랜잭션 생성 시작`);
    
    try {
      // 새 블록 생성
      const blockData = this.generateBlockData(blockNumber, now);
      
      // 블록을 DB에 저장
      const [insertedBlock] = await this.db.insert(Block).values(blockData).returning();
      
      // 단일 트랜잭션 생성
      const transactionData = this.generateTransactionData(
        blockNumber,
        blockData.hash,
        0, // 첫 번째 트랜잭션
        now
      );
      
      // 트랜잭션을 DB에 저장
      const [insertedTransaction] = await this.db.insert(Transaction).values(transactionData).returning();
      
      this.addLog('info', `블록 ${blockNumber}에 단일 트랜잭션 생성 완료 (Hash: ${transactionData.hash.substring(0, 10)}...)`, 1, 1);
      
      return {
        transaction: insertedTransaction,
        block: insertedBlock
      };
      
    } catch (error) {
      this.addLog('error', `단일 트랜잭션 생성 중 오류: ${error}`);
      throw error;
    }
  }

  // 설정 업데이트
  updateConfiguration(newConfig: Partial<TransactionGeneratorConfig>) {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };
    
    this.addLog('info', `설정 업데이트: ${JSON.stringify(oldConfig)} -> ${JSON.stringify(this.config)}`);

    // 활성화 상태가 변경되면 스케줄러 재시작
    if (oldConfig.enabled !== this.config.enabled) {
      if (this.config.enabled) {
        this.startScheduler();
      } else {
        this.stopScheduler();
      }
    }
  }

  // 현재 설정 조회
  getConfiguration(): TransactionGeneratorConfig {
    return { ...this.config };
  }

  // 로그 조회
  getLogs(page: number = 1, limit: number = 50, date?: string): { logs: TransactionLog[], total: number, page: number, limit: number } {
    let filteredLogs = this.logs;

    if (date) {
      const targetDate = new Date(date);
      filteredLogs = this.logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate.toDateString() === targetDate.toDateString();
      });
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    return {
      logs: paginatedLogs,
      total: filteredLogs.length,
      page,
      limit,
    };
  }

  // 스케줄 상태 조회
  getScheduleStatus() {
    return {
      isRunning: this.scheduledJob !== null,
      config: this.config,
      nextRun: this.scheduledJob?.nextInvocation()?.toISOString() || null,
    };
  }
} 