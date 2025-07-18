#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { Transaction, Block } from '../src/database/schema';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

config();

// API_SCOPE 환경변수 확인
const API_SCOPE = process.env.API_SCOPE;
if (API_SCOPE !== 'TRANSACTION') {
  console.log('❌ API_SCOPE가 TRANSACTION이 아닙니다. 종료합니다.');
  process.exit(0);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const client = postgres(connectionString);
const db = drizzle(client);

// 로그 디렉토리 생성
const LOG_DIR = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// 로그 파일 경로
const LOG_FILE = path.join(LOG_DIR, `transaction-generator-${new Date().toISOString().split('T')[0]}.log`);

// 로그 함수
function log(message: string): void {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  console.log(message);
  try {
    fs.appendFileSync(LOG_FILE, logMessage);
  } catch (error) {
    console.error('로그 파일 쓰기 실패:', error);
  }
}

// 설정값들
const MIN_TRANSACTIONS_PER_DAY = 100;
const MAX_TRANSACTIONS_PER_DAY = 200;
const TRANSACTIONS_PER_BLOCK = 20; // 블록당 평균 트랜잭션 수

// 컨트랙트별 가중치 및 함수 매핑 (zkEVM 기반)
const CONTRACT_CONFIG = {
  '0x671645FC21615fdcAA332422D5603f1eF9752E03': {
    name: '메인 컨트랙트',
    weight: 50, // 50% - 가장 빈번한 토큰 거래
    functions: ['transfer', 'approve', 'transferFrom', 'mint', 'burn']
  },
  '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063': {
    name: '신원인증 컨트랙트', 
    weight: 30, // 30% - 가입/인증 갱신 시
    functions: ['verifyIdentity', 'updateIdentity', 'submitVerification', 'approveVerification', 'getIdentityStatus', 'revokeIdentity']
  },
  '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174': {
    name: '배지발급 컨트랙트',
    weight: 20, // 20% - 특정 이벤트/성취 시
    functions: ['mintBadge', 'awardBadge', 'transferBadge', 'updateBadgeMetadata', 'getBadgeInfo', 'revokeBadge', 'burnBadge']
  }
};

// 가중치 기반 컨트랙트 선택을 위한 배열 생성
const CONTRACT_ADDRESSES = Object.keys(CONTRACT_CONFIG);
const FUNCTION_NAMES = Object.values(CONTRACT_CONFIG).flatMap(config => config.functions);

// 유틸리티 함수들
function generateRandomHash(): string {
  return '0x' + crypto.randomBytes(32).toString('hex');
}

// 가중치 기반 컨트랙트 선택 함수
function selectContractByWeight(): { address: string; functionName: string } | null {
  const isContractInteraction = Math.random() < 0.7; // 70% 확률로 컨트랙트 상호작용
  
  if (!isContractInteraction) {
    return null;
  }
  
  // 가중치 기반 선택
  const totalWeight = Object.values(CONTRACT_CONFIG).reduce((sum, config) => sum + config.weight, 0);
  let randomWeight = Math.random() * totalWeight;
  
  for (const [address, config] of Object.entries(CONTRACT_CONFIG)) {
    randomWeight -= config.weight;
    if (randomWeight <= 0) {
      // 선택된 컨트랙트의 함수 중 랜덤 선택
      const functionName = config.functions[Math.floor(Math.random() * config.functions.length)];
      return { address, functionName };
    }
  }
  
  // 기본값 (도달하지 않아야 함)
  const firstContract = Object.entries(CONTRACT_CONFIG)[0];
  const functionName = firstContract[1].functions[0];
  return { address: firstContract[0], functionName };
}

function generateRandomAddress(): string {
  return '0x' + crypto.randomBytes(20).toString('hex');
}

function generateRandomValue(): string {
  const ethAmount = Math.random() * 9.999 + 0.001; // 0.001 ~ 10 ETH
  const weiAmount = Math.floor(ethAmount * 1e18);
  return weiAmount.toString();
}

function generateGasValues() {
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
async function getLatestBlockNumber(): Promise<number> {
  try {
    const result = await db
      .select({ number: Block.number })
      .from(Block)
      .orderBy(Block.number)
      .limit(1);
      
    if (result.length === 0) {
      return 18500000; // 기본 시작 블록
    }
    
    return parseInt(result[0].number) + 1;
  } catch (error) {
    console.log('블록 조회 중 오류, 기본값 사용:', error);
    return 18500000;
  }
}

// 블록 데이터 생성
function generateBlockData(blockNumber: number, timestamp: Date): typeof Block.$inferInsert {
  const gasUsed = Math.floor(Math.random() * 5000000) + 1000000; // 1M ~ 6M
  const gasLimit = gasUsed + Math.floor(Math.random() * 2000000);
  
  return {
    number: blockNumber.toString(),
    hash: generateRandomHash(),
    parentHash: generateRandomHash(),
    miner: generateRandomAddress(),
    timestamp: Math.floor(timestamp.getTime() / 1000).toString(),
    gasLimit: gasLimit.toString(),
    gasUsed: gasUsed.toString(),
    size: (Math.floor(Math.random() * 50000) + 20000).toString(),
  };
}

// 트랜잭션 데이터 생성
function generateTransactionData(
  blockNumber: number,
  blockHash: string,
  transactionIndex: number,
  timestamp: Date
): typeof Transaction.$inferInsert {
  const gasValues = generateGasValues();
  const isError = Math.random() < 0.01; // 1% 확률로 에러
  
  // 가중치 기반 컨트랙트 및 함수 선택
  const contractSelection = selectContractByWeight();
  const contractAddress = contractSelection?.address || null;
  const functionName = contractSelection?.functionName || null;
  
  return {
    blockNumber: blockNumber.toString(),
    timeStamp: Math.floor(timestamp.getTime() / 1000).toString(),
    hash: generateRandomHash(),
    nonce: Math.floor(Math.random() * 100000).toString(),
    blockHash: blockHash,
    transactionIndex: transactionIndex.toString(),
    fromAddress: generateRandomAddress(),
    toAddress: contractAddress || generateRandomAddress(),
    value: generateRandomValue(),
    gas: gasValues.gas,
    gasPrice: gasValues.gasPrice,
    isError: isError ? '1' : '0',
    txreceiptStatus: isError ? '0' : '1',
    input: contractAddress ? '0x' + crypto.randomBytes(25).toString('hex') : '0x',
    contractAddress: contractAddress,
    cumulativeGasUsed: gasValues.gasUsed,
    gasUsed: gasValues.gasUsed,
    confirmations: Math.floor(Math.random() * 100).toString(),
    methodId: contractAddress ? '0x' + crypto.randomBytes(4).toString('hex') : null,
    functionName: functionName,
  };
}

// 불규칙적인 지연 시간 생성 (1-30분)
function getRandomDelay(): number {
  const minDelay = 1 * 60 * 1000; // 1분
  const maxDelay = 30 * 60 * 1000; // 30분
  return Math.floor(Math.random() * (maxDelay - minDelay) + minDelay);
}

// 하루 동안의 트랜잭션 생성 계획
function generateDayPlan(): number[] {
  const totalTransactions = Math.floor(
    Math.random() * (MAX_TRANSACTIONS_PER_DAY - MIN_TRANSACTIONS_PER_DAY) + 
    MIN_TRANSACTIONS_PER_DAY
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

// 배치 생성 및 삽입
async function generateAndInsertBatch(count: number): Promise<void> {
  const blocks: (typeof Block.$inferInsert)[] = [];
  const transactions: (typeof Transaction.$inferInsert)[] = [];
  
  let blockNumber = await getLatestBlockNumber();
  const now = new Date();
  
  let transactionIndex = 0;
  let currentBlockTxCount = 0;
  let currentBlockHash = generateRandomHash();
  
  // 첫 번째 블록 생성
  blocks.push(generateBlockData(blockNumber, now));
  
  for (let i = 0; i < count; i++) {
    // 블록당 트랜잭션 수 초과시 새 블록 생성
    if (currentBlockTxCount >= TRANSACTIONS_PER_BLOCK) {
      blockNumber++;
      currentBlockHash = generateRandomHash();
      currentBlockTxCount = 0;
      transactionIndex = 0;
      
      // 새 블록 시간은 1-3분 후로 설정
      const blockTime = new Date(now.getTime() + Math.random() * 2 * 60 * 1000 + 60 * 1000);
      blocks.push(generateBlockData(blockNumber, blockTime));
    }
    
    // 트랜잭션 시간을 현재 시간 기준으로 약간 랜덤화
    const txTime = new Date(now.getTime() + Math.random() * 60 * 1000);
    
    transactions.push(generateTransactionData(
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
      await db.insert(Block).values(blocks).onConflictDoNothing();
    }
    
    // 트랜잭션 삽입
    if (transactions.length > 0) {
      await db.insert(Transaction).values(transactions).onConflictDoNothing();
    }
    
    log(`✅ ${count}개 트랜잭션 생성 완료 (블록: ${blocks.length}개)`);
  } catch (error) {
    log(`❌ 데이터 삽입 중 오류: ${error}`);
    throw error;
  }
}

// 시간별 트랜잭션 생성 함수
async function generateTransactionsForHour(count: number): Promise<void> {
  if (count === 0) return;
  
  // 시간 내에서 불규칙적으로 분산
  const intervals: number[] = [];
  const hourInMs = 60 * 60 * 1000;
  
  for (let i = 0; i < count; i++) {
    intervals.push(Math.random() * hourInMs);
  }
  
  intervals.sort((a, b) => a - b);
  
  for (let i = 0; i < intervals.length; i++) {
    const delay = i === 0 ? intervals[i] : intervals[i] - intervals[i - 1];
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // 1-5개 트랜잭션을 한 번에 생성
    const batchSize = Math.floor(Math.random() * 5) + 1;
    await generateAndInsertBatch(batchSize);
  }
}

// 메인 데몬 함수
async function startTransactionDaemon(): Promise<void> {
  log('🚀 자동 트랜잭션 생성기 시작');
  log(`📊 설정: 하루 ${MIN_TRANSACTIONS_PER_DAY}-${MAX_TRANSACTIONS_PER_DAY}개 트랜잭션`);
  log(`🔧 API_SCOPE: ${API_SCOPE}`);
  
  // 무한 루프로 매일 실행
  while (true) {
    const dayPlan = generateDayPlan();
    const totalForToday = dayPlan.reduce((sum, count) => sum + count, 0);
    
    log(`📅 오늘 생성 예정: ${totalForToday}개 트랜잭션`);
    log(`⏰ 시간별 분포: ${dayPlan.join(', ')}`);
    
    // 각 시간대별로 트랜잭션 생성
    for (let hour = 0; hour < 24; hour++) {
      const currentHour = new Date().getHours();
      
      if (hour === currentHour) {
        log(`🕐 ${hour}시: ${dayPlan[hour]}개 트랜잭션 생성 시작`);
        await generateTransactionsForHour(dayPlan[hour]);
        log(`✅ ${hour}시 완료`);
      } else {
        // 다음 시간까지 대기
        const now = new Date();
        const nextHour = new Date(now);
        nextHour.setHours(hour, 0, 0, 0);
        
        if (nextHour <= now) {
          nextHour.setDate(nextHour.getDate() + 1);
        }
        
        const delay = nextHour.getTime() - now.getTime();
        log(`⏳ ${hour}시까지 ${Math.round(delay / 1000 / 60)}분 대기`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        log(`🕐 ${hour}시: ${dayPlan[hour]}개 트랜잭션 생성 시작`);
        await generateTransactionsForHour(dayPlan[hour]);
        log(`✅ ${hour}시 완료`);
      }
    }
    
    log('🌙 하루 완료. 내일 계획 생성 중...');
  }
}

// 프로그램 시작
if (require.main === module) {
  startTransactionDaemon().catch(error => {
    console.error('❌ 트랜잭션 데몬 오류:', error);
    process.exit(1);
  });
} 