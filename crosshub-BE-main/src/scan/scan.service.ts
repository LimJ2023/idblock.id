import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { and, count, desc, asc, eq, SQL, sql, gt, lt } from 'drizzle-orm';
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
    const { 
      contractAddress, 
      page = '1', 
      limit = '10', 
      sort = 'desc',
      // 커서 기반 페이지네이션을 위한 파라미터
      cursor,
      skipCount = false // 첫 번째 페이지에서는 count를 스킵할 수 있는 옵션
    } = query;
    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    // 조건 구성
    const conditions: SQL[] = [];
    if (contractAddress) {
      conditions.push(eq(Transaction.contractAddress, contractAddress));
    }

    // 커서 기반 페이지네이션 조건
    if (cursor) {
      if (sort === 'desc') {
        conditions.push(lt(Transaction.timeStamp, cursor));
      } else {
        conditions.push(gt(Transaction.timeStamp, cursor));
      }
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    // 총 개수 조회 최적화 - 첫 번째 페이지이고 skipCount가 true이면 생략
    let total: number | null = null;
    if (!skipCount || pageNum > 1) {
      const [totalResult] = await this.db
        .select({ count: count() })
        .from(Transaction)
        .where(whereCondition);
      total = Number(totalResult.count);
    }

    // 데이터 조회 - timeStamp 문자열을 직접 정렬 (인덱스 활용)
    // PostgreSQL에서 숫자 문자열을 정렬하려면 lpad를 사용하거나
    // 또는 timeStamp가 일정한 길이라면 문자열 정렬도 가능
    const orderBy = sort === 'desc' ? 
      desc(sql`${Transaction.timeStamp}::bigint`) : 
      asc(sql`${Transaction.timeStamp}::bigint`);

    // 쿼리 실행
    let transactions;
    if (cursor) {
      // 커서 기반 페이지네이션
      transactions = await this.db
        .select()
        .from(Transaction)
        .where(whereCondition)
        .orderBy(orderBy)
        .limit(limitNum);
    } else {
      // 일반 offset 기반 페이지네이션
      transactions = await this.db
        .select()
        .from(Transaction)
        .where(whereCondition)
        .orderBy(orderBy)
        .limit(limitNum)
        .offset(offset);
    }

    // 다음 커서 계산 (마지막 항목의 timeStamp)
    const nextCursor = transactions.length > 0 ? 
      transactions[transactions.length - 1].timeStamp : null;

    return {
      success: true,
      data: this.transformDates(transactions),
      total,
      page: pageNum,
      limit: limitNum,
      nextCursor,
      hasMore: transactions.length === limitNum
    };
  }

  // 빠른 최신 트랜잭션 조회 (count 없이)
  async getLatestTransactions(query: { 
    contractAddress?: string; 
    limit?: string; 
    sort?: 'desc' | 'asc' 
  }) {
    const { contractAddress, limit = '10', sort = 'desc' } = query;
    const limitNum = parseInt(limit, 10);

    const conditions: SQL[] = [];
    if (contractAddress) {
      conditions.push(eq(Transaction.contractAddress, contractAddress));
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    const orderBy = sort === 'desc' ? 
      desc(sql`${Transaction.timeStamp}::bigint`) : 
      asc(sql`${Transaction.timeStamp}::bigint`);
    
    const transactions = await this.db
      .select()
      .from(Transaction)
      .where(whereCondition)
      .orderBy(orderBy)
      .limit(limitNum);

    const nextCursor = transactions.length > 0 ? 
      transactions[transactions.length - 1].timeStamp : null;

    return {
      success: true,
      data: this.transformDates(transactions),
      nextCursor,
      hasMore: transactions.length === limitNum
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
    const { page = '1', limit = '10', sort = 'desc', skipCount = false } = query;
    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    // 총 개수 조회 최적화
    let total: number | null = null;
    if (!skipCount || pageNum > 1) {
      const [totalResult] = await this.db
        .select({ count: count() })
        .from(Block);
      total = Number(totalResult.count);
    }

    // 데이터 조회 - timestamp 직접 정렬
    const orderBy = sort === 'desc' ? 
      desc(sql`${Block.timestamp}::bigint`) : 
      asc(sql`${Block.timestamp}::bigint`);
    
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