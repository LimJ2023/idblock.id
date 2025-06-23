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
  const endDate = new Date('2025-06-30T23:59:59Z');
  const peakDate = new Date('2025-01-15T12:00:00Z'); // 2025년 1월 중순 피크
  
  // 전체 기간을 일 단위로 계산
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const peakDay = Math.ceil((peakDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // 베타 분포를 사용하여 피크 근처에서 높은 확률을 가지도록 조정
  const alpha = 2;
  const beta = 2;
  
  // 0~1 사이의 랜덤 값을 베타 분포로 변환
  let u1 = Math.random();
  let u2 = Math.random();
  
  // Box-Muller 변환을 사용한 정규분포 근사
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const normalizedZ = (z + 3) / 6; // -3~3을 0~1로 정규화
  const clampedZ = Math.max(0, Math.min(1, normalizedZ));
  
  // 피크 중심으로 조정
  const adjustedValue = Math.pow(clampedZ, 0.5); // 피크를 더 강하게
  const dayOffset = Math.floor(adjustedValue * totalDays);
  
  // 피크 날짜를 중심으로 분포 조정
  const finalDay = Math.floor(peakDay + (dayOffset - totalDays / 2) * 0.8);
  const constrainedDay = Math.max(0, Math.min(totalDays - 1, finalDay));
  
  const resultDate = new Date(startDate.getTime() + constrainedDay * 24 * 60 * 60 * 1000);
  
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

// 가스 값 생성
function generateGasValues() {
  const gasLimit = Math.floor(Math.random() * 8000000) + 21000; // 21k ~ 8M
  const gasUsed = Math.floor(gasLimit * (0.3 + Math.random() * 0.7)); // 30% ~ 100% 사용
  const gasPrice = Math.floor(Math.random() * 200) + 10; // 10 ~ 210 Gwei
  
  return {
    gas: gasLimit.toString(),
    gasUsed: gasUsed.toString(),
    gasPrice: (gasPrice * 1e9).toString(), // Gwei to Wei
  };
}

// 컨트랙트 주소 풀 (실제 유명한 컨트랙트들 + 랜덤)
const CONTRACT_ADDRESSES = [
  '0x671645FC21615fdcAA332422D5603f1eF9752E03', // 요청에서 언급된 주소
  '0xA0b86a33E6441E8F2C2b4A4E5a9e24B4b6e2A5F4', // USDC
  '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
  '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
  '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', // MATIC
  '0x514910771AF9Ca656af840dff83E8264EcF986CA', // LINK
  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
];

// 함수 이름 풀
const FUNCTION_NAMES = [
  'transfer',
  'approve',
  'transferFrom',
  'mint',
  'burn',
  'swap',
  'addLiquidity',
  'removeLiquidity',
  'stake',
  'unstake',
  'claim',
  'deposit',
  'withdraw',
  'vote',
  'delegate',
];

// 블록 데이터 생성
function generateBlockData(blockNumber: number, timestamp: Date): typeof Block.$inferInsert {
  const gasUsed = Math.floor(Math.random() * 15000000) + 5000000; // 5M ~ 20M
  const gasLimit = gasUsed + Math.floor(Math.random() * 5000000); // gasUsed보다 조금 더 큰 값
  
  return {
    number: blockNumber.toString(),
    hash: generateRandomHash(),
    parentHash: generateRandomHash(),
    miner: generateRandomAddress(),
    timestamp: Math.floor(timestamp.getTime() / 1000).toString(),
    gasLimit: gasLimit.toString(),
    gasUsed: gasUsed.toString(),
    size: (Math.floor(Math.random() * 100000) + 10000).toString(), // 10KB ~ 110KB
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
  const isContractInteraction = Math.random() < 0.3; // 30% 확률로 컨트랙트 상호작용
  const isError = Math.random() < 0.02; // 2% 확률로 에러
  
  const contractAddress = isContractInteraction ? 
    CONTRACT_ADDRESSES[Math.floor(Math.random() * CONTRACT_ADDRESSES.length)] : 
    null;
    
  const functionName = isContractInteraction ? 
    FUNCTION_NAMES[Math.floor(Math.random() * FUNCTION_NAMES.length)] : 
    null;
  
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
  console.log('  - 총 데이터: 480,000개 트랜잭션');
  
  const TOTAL_TRANSACTIONS = 480000;
  const BATCH_SIZE = 1000;
  const TRANSACTIONS_PER_BLOCK = 50; // 블록당 평균 트랜잭션 수
  
  let currentBlockNumber = 18500000; // 시작 블록 번호
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