import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { and, count, desc, asc, eq, SQL, sql } from 'drizzle-orm';
import { DrizzleDB, INJECT_DRIZZLE } from 'src/database/drizzle.provider';
import { Block, Transaction } from 'src/database/schema';
import { GetTransactionsQueryDto, GetBlocksQueryDto } from './scan.dto';

@Injectable()
export class ScanService {
  constructor(
    @Inject(INJECT_DRIZZLE) private readonly db: DrizzleDB,
  ) {}

  // 날짜 변환 헬퍼 함수
  private transformDates(data: any): any {
    if (Array.isArray(data)) {
      return data.map(item => this.transformDates(item));
    }
    
    if (data && typeof data === 'object') {
      const transformed = { ...data };
      if (transformed.createdAt instanceof Date) {
        transformed.createdAt = transformed.createdAt.toISOString();
      }
      if (transformed.updatedAt instanceof Date) {
        transformed.updatedAt = transformed.updatedAt.toISOString();
      }
      // BigInt을 문자열로 변환
      if (typeof transformed.id === 'bigint') {
        transformed.id = transformed.id.toString();
      }
      return transformed;
    }
    
    return data;
  }

  async getTransactions(query: GetTransactionsQueryDto) {
    const { contractAddress, page = '1', limit = '10', sort = 'desc' } = query;
    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10); // 최대 제한 제거
    const offset = (pageNum - 1) * limitNum;

    // 조건 구성
    const conditions: SQL[] = [];
    if (contractAddress) {
      conditions.push(eq(Transaction.contractAddress, contractAddress));
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    // 총 개수 조회
    const [totalResult] = await this.db
      .select({ count: count() })
      .from(Transaction)
      .where(whereCondition);

    const total = Number(totalResult.count);

    // 데이터 조회 (timeStamp를 숫자로 변환하여 정렬 - 최근 날짜가 먼저 보이도록)
    const orderBy = sort === 'desc' ? 
      desc(sql`CAST(${Transaction.timeStamp} AS BIGINT)`) : 
      asc(sql`CAST(${Transaction.timeStamp} AS BIGINT)`);
    
    const transactions = await this.db
      .select()
      .from(Transaction)
      .where(whereCondition)
      .orderBy(orderBy)
      .limit(limitNum)
      .offset(offset);

    return {
      success: true,
      data: this.transformDates(transactions),
      total,
      page: pageNum,
      limit: limitNum,
    };
  }

  async getTransactionByHash(hash: string) {
    const transaction = await this.db
      .select()
      .from(Transaction)
      .where(eq(Transaction.hash, hash))
      .limit(1);

    if (!transaction.length) {
      throw new NotFoundException(`트랜잭션을 찾을 수 없습니다: ${hash}`);
    }

    return {
      success: true,
      data: this.transformDates(transaction[0]),
    };
  }

  async getBlocks(query: GetBlocksQueryDto) {
    const { page = '1', limit = '10', sort = 'desc' } = query;
    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    // 총 개수 조회
    const [totalResult] = await this.db
      .select({ count: count() })
      .from(Block);

    const total = Number(totalResult.count);

    // 데이터 조회 (timestamp를 숫자로 변환하여 정렬 - 최근 날짜가 먼저 보이도록)
    const orderBy = sort === 'desc' ? 
      desc(sql`CAST(${Block.timestamp} AS BIGINT)`) : 
      asc(sql`CAST(${Block.timestamp} AS BIGINT)`);
    
    const blocks = await this.db
      .select()
      .from(Block)
      .orderBy(orderBy)
      .limit(limitNum)
      .offset(offset);

    return {
      success: true,
      data: this.transformDates(blocks),
      total,
      page: pageNum,
      limit: limitNum,
    };
  }

  async getBlockByNumber(blockNumber: string) {
    const block = await this.db
      .select()
      .from(Block)
      .where(eq(Block.number, blockNumber))
      .limit(1);

    if (!block.length) {
      throw new NotFoundException(`블록을 찾을 수 없습니다: ${blockNumber}`);
    }

    return {
      success: true,
      data: this.transformDates(block[0]),
    };
  }

  // 데이터 삽입 메서드들 (외부 API에서 데이터를 가져와 저장할 때 사용)
  async insertTransaction(transactionData: typeof Transaction.$inferInsert) {
    return await this.db
      .insert(Transaction)
      .values(transactionData)
      .onConflictDoNothing({ target: Transaction.hash })
      .returning();
  }

  async insertBlock(blockData: typeof Block.$inferInsert) {
    return await this.db
      .insert(Block)
      .values(blockData)
      .onConflictDoNothing({ target: Block.number })
      .returning();
  }

  async insertTransactions(transactionsData: (typeof Transaction.$inferInsert)[]) {
    if (transactionsData.length === 0) return [];
    
    return await this.db
      .insert(Transaction)
      .values(transactionsData)
      .onConflictDoNothing({ target: Transaction.hash })
      .returning();
  }

  async insertBlocks(blocksData: (typeof Block.$inferInsert)[]) {
    if (blocksData.length === 0) return [];
    
    return await this.db
      .insert(Block)
      .values(blocksData)
      .onConflictDoNothing({ target: Block.number })
      .returning();
  }
} 