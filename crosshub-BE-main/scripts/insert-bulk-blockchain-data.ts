#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { Transaction, Block } from '../src/database/schema';
import * as crypto from 'crypto';

config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const client = postgres(connectionString);
const db = drizzle(client);

// 가중치가 적용된 날짜 생성 함수 (2025년 1월에 피크)
function generateWeightedDate(): Date {
  const startDate = new Date('2024-11-01T00:00:00Z');
  const endDate = new Date('2025-07-23T23:59:59Z');
  const peakDate = new Date('2025-01-15T12:00:00Z'); // 2025년 1월 중순 피크
  
  // 전체 기간을 밀리초로 계산
  const totalMs = endDate.getTime() - startDate.getTime();
  const peakMs = peakDate.getTime() - startDate.getTime();
  
  // 정규분포를 사용하여 피크 근처에서 높은 확률 생성
  // Box-Muller 변환으로 정규분포 생성
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  
  // 표준편차를 조정하여 분포의 폭 조절 (전체 기간의 1/6 정도)
  const stdDev = totalMs / 6;
  const normalValue = z * stdDev + peakMs;
  
  // 범위 내로 제한
  const constrainedMs = Math.max(0, Math.min(totalMs, normalValue));
  
  // 최종 날짜 생성
  const resultDate = new Date(startDate.getTime() + constrainedMs);
  
  // 하루 내 랜덤 시간 추가
  const randomHours = Math.floor(Math.random() * 24);
  const randomMinutes = Math.floor(Math.random() * 60);
  const randomSeconds = Math.floor(Math.random() * 60);
  
  resultDate.setHours(randomHours, randomMinutes, randomSeconds);
  
  return resultDate;
}

// 랜덤 해시 생성
function generateRandomHash(): string {
  return '0x' + crypto.randomBytes(32).toString('hex');
}

// 랜덤 주소 생성
function generateRandomAddress(): string {
  return '0x' + crypto.randomBytes(20).toString('hex');
}

// Wei 단위 랜덤 값 생성 (0.001 ETH ~ 100 ETH)
function generateRandomValue(): string {
  const ethAmount = Math.random() * 99.999 + 0.001; // 0.001 ~ 100 ETH
  const weiAmount = Math.floor(ethAmount * 1e18);
  return weiAmount.toString();
}

// 함수별 가스 사용량 정의
const GAS_USAGE_BY_FUNCTION = {
  // 신원인증 관련 함수들 (중간 정도의 가스 사용)
  'verifyIdentity': { min: 80000, max: 180000 },
  'updateIdentity': { min: 90000, max: 200000 },
  'submitVerification': { min: 70000, max: 150000 },
  'approveVerification': { min: 85000, max: 170000 },
  'getIdentityStatus': { min: 25000, max: 40000 }, // 읽기 함수
  'revokeIdentity': { min: 60000, max: 120000 },
  
  // 배지 발급 관련 함수들 (높은 가스 사용)
  'mintBadge': { min: 150000, max: 350000 },
  'awardBadge': { min: 180000, max: 400000 },
  'transferBadge': { min: 120000, max: 250000 },
  'updateBadgeMetadata': { min: 100000, max: 200000 },
  'getBadgeInfo': { min: 30000, max: 50000 }, // 읽기 함수
  'revokeBadge': { min: 80000, max: 160000 },
  'burnBadge': { min: 70000, max: 140000 },
};

// 가스 값 생성 (함수명에 따른 적절한 가스 사용량)
function generateGasValues(functionName?: string) {
  let gasUsed: number;
  
  if (functionName && GAS_USAGE_BY_FUNCTION[functionName]) {
    // 함수별 맞춤 가스 사용량
    const range = GAS_USAGE_BY_FUNCTION[functionName];
    gasUsed = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  } else {
    // 일반 ETH 전송 또는 기타 함수
    gasUsed = Math.floor(Math.random() * 40000) + 21000; // 21k ~ 61k
  }
  
  // gasLimit은 gasUsed보다 10-30% 높게 설정
  const gasLimit = Math.floor(gasUsed * (1.1 + Math.random() * 0.2));
  
  // 현실적인 가스 가격 범위 (15-80 Gwei, 2024-2025년 기준)
  const gasPrice = Math.floor(Math.random() * 65) + 15; // 15 ~ 80 Gwei
  
  return {
    gas: gasLimit.toString(),
    gasUsed: gasUsed.toString(),
    gasPrice: (gasPrice * 1e9).toString(), // Gwei to Wei
  };
}

// 컨트랙트 주소 풀
const CONTRACT_ADDRESSES = [
  '0x671645FC21615fdcAA332422D5603f1eF9752E03', // 메인 컨트랙트
  '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', // 신원인증 컨트랙트
  // '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // 배지발급 컨트랙트
];

// 함수 이름 풀
const FUNCTION_NAMES = [
  'verifyIdentity',
  'updateIdentity',
  'submitVerification',
  'approveVerification',
  'getIdentityStatus',
  'revokeIdentity',
  // 'mintBadge',
  // 'awardBadge',
  // 'transferBadge',
  // 'updateBadgeMetadata',
  // 'getBadgeInfo',
  // 'revokeBadge',
  // 'burnBadge',
];

// 블록 데이터 생성
function generateBlockData(blockNumber: number, timestamp: Date): typeof Block.$inferInsert {
  // 신원인증/배지발급 컨트랙트가 포함된 블록의 특성을 고려한 가스 사용량
  // 블록당 평균 50개 트랜잭션, 각각 80k~400k 가스 사용 시 4M~20M 정도
  const gasUsed = Math.floor(Math.random() * 16000000) + 4000000; // 4M ~ 20M
  
  // gasLimit은 gasUsed보다 5-15% 높게 설정 (블록 생성자가 여유분 확보)
  const gasLimit = Math.floor(gasUsed * (1.05 + Math.random() * 0.1));
  
  return {
    number: blockNumber.toString(),
    hash: generateRandomHash(),
    parentHash: generateRandomHash(),
    miner: generateRandomAddress(),
    timestamp: Math.floor(timestamp.getTime() / 1000).toString(),
    gasLimit: gasLimit.toString(),
    gasUsed: gasUsed.toString(),
    size: (Math.floor(Math.random() * 80000) + 20000).toString(), // 20KB ~ 100KB (컨트랙트 호출로 인해 더 큰 사이즈)
  };
}

// 트랜잭션 데이터 생성
function generateTransactionData(
  blockNumber: number,
  blockHash: string,
  transactionIndex: number,
  timestamp: Date
): typeof Transaction.$inferInsert {
  const isContractInteraction = Math.random() < 0.95; // 95% 확률로 컨트랙트 상호작용
  const isError = Math.random() < 0.001; // 0.1% 확률로 에러
  
  const contractAddress = isContractInteraction ? 
    CONTRACT_ADDRESSES[Math.floor(Math.random() * CONTRACT_ADDRESSES.length)] : 
    null;
    
  const functionName = isContractInteraction ? 
    FUNCTION_NAMES[Math.floor(Math.random() * FUNCTION_NAMES.length)] : 
    null;
    
  // 함수명을 기반으로 적절한 가스 값 생성
  const gasValues = generateGasValues(functionName || undefined);
  
  return {
    blockNumber: blockNumber.toString(),
    timeStamp: Math.floor(timestamp.getTime() / 1000).toString(),
    hash: generateRandomHash(),
    nonce: Math.floor(Math.random() * 1000000).toString(),
    blockHash: blockHash,
    transactionIndex: transactionIndex.toString(),
    fromAddress: generateRandomAddress(),
    toAddress: contractAddress || generateRandomAddress(),
    value: generateRandomValue(),
    gas: gasValues.gas,
    gasPrice: gasValues.gasPrice,
    isError: isError ? '1' : '0',
    txreceiptStatus: isError ? '0' : '1',
    input: isContractInteraction ? '0x' + crypto.randomBytes(50).toString('hex') : '0x',
    contractAddress: contractAddress,
    cumulativeGasUsed: gasValues.gasUsed,
    gasUsed: gasValues.gasUsed,
    confirmations: Math.floor(Math.random() * 1000).toString(),
    methodId: isContractInteraction ? '0x' + crypto.randomBytes(4).toString('hex') : null,
    functionName: functionName,
  };
}

// 배치 삽입 함수
async function insertBatch(
  blocks: (typeof Block.$inferInsert)[],
  transactions: (typeof Transaction.$inferInsert)[]
) {
  try {
    // 블록 먼저 삽입
    if (blocks.length > 0) {
      await db.insert(Block).values(blocks).onConflictDoNothing();
    }
    
    // 트랜잭션 삽입
    if (transactions.length > 0) {
      await db.insert(Transaction).values(transactions).onConflictDoNothing();
    }
  } catch (error) {
    console.error('배치 삽입 중 오류:', error);
    throw error;
  }
}

// 메인 함수
async function insertBulkBlockchainData() {
  console.log('🚀 대용량 블록체인 데이터 삽입 시작...');
  console.log('📊 조건:');
  console.log('  - 기간: 2024년 11월 ~ 2025년 6월');
  console.log('  - 피크: 2025년 1월');
  console.log('  - 총 데이터: 260000개 트랜잭션');
  
  const TOTAL_TRANSACTIONS = 260000;
  const BATCH_SIZE = 1000;
  const TRANSACTIONS_PER_BLOCK = 50; // 블록당 평균 트랜잭션 수
  
  let currentBlockNumber = 19500000; // 시작 블록 번호
  let insertedTransactions = 0;
  
  // 진행률 표시용
  const startTime = Date.now();
  
  try {
    while (insertedTransactions < TOTAL_TRANSACTIONS) {
      const blocks: (typeof Block.$inferInsert)[] = [];
      const transactions: (typeof Transaction.$inferInsert)[] = [];
      
      const remainingTransactions = TOTAL_TRANSACTIONS - insertedTransactions;
      const currentBatchSize = Math.min(BATCH_SIZE, remainingTransactions);
      
      // 블록별로 트랜잭션 생성
      let transactionsInBatch = 0;
      
      while (transactionsInBatch < currentBatchSize) {
        const timestamp = generateWeightedDate();
        const blockData = generateBlockData(currentBlockNumber, timestamp);
        
        blocks.push(blockData);
        
        // 현재 블록에 넣을 트랜잭션 수 결정 (20~80개 랜덤)
        const txCountInBlock = Math.min(
          Math.floor(Math.random() * 61) + 20, // 20~80개
          currentBatchSize - transactionsInBatch
        );
        
        // 블록 내 트랜잭션들 생성
        for (let i = 0; i < txCountInBlock; i++) {
          const txData = generateTransactionData(
            currentBlockNumber,
            blockData.hash!,
            i,
            timestamp
          );
          transactions.push(txData);
          transactionsInBatch++;
        }
        
        currentBlockNumber++;
      }
      
      await insertBatch(blocks, transactions);
      insertedTransactions += currentBatchSize;
      
      // 진행률 표시
      const progress = (insertedTransactions / TOTAL_TRANSACTIONS * 100).toFixed(1);
      const elapsed = (Date.now() - startTime) / 1000;
      const eta = (elapsed / insertedTransactions) * (TOTAL_TRANSACTIONS - insertedTransactions);
      
      console.log(
        `📈 진행률: ${progress}% (${insertedTransactions.toLocaleString()}/${TOTAL_TRANSACTIONS.toLocaleString()}) ` +
        `| 경과시간: ${Math.floor(elapsed)}초 | 예상완료: ${Math.floor(eta)}초`
      );
    }
    
    const totalTime = (Date.now() - startTime) / 1000;
    console.log('\n✅ 데이터 삽입 완료!');
    console.log(`📊 통계:`);
    console.log(`  - 총 트랜잭션: ${TOTAL_TRANSACTIONS.toLocaleString()}개`);
    console.log(`  - 총 블록: ${(currentBlockNumber - 18500000).toLocaleString()}개`);
    console.log(`  - 소요시간: ${Math.floor(totalTime)}초`);
    console.log(`  - 초당 처리량: ${Math.floor(TOTAL_TRANSACTIONS / totalTime).toLocaleString()}개/초`);
    
  } catch (error) {
    console.error('❌ 데이터 삽입 중 오류 발생:', error);
  } finally {
    await client.end();
  }
}

// 스크립트 실행
if (require.main === module) {
  insertBulkBlockchainData()
    .then(() => {
      console.log('🎉 스크립트 실행 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
} 