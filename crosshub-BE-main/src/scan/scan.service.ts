import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { and, count, desc, asc, eq, SQL, sql, gt, lt, inArray } from 'drizzle-orm';
import { DrizzleDB, INJECT_DRIZZLE } from 'src/database/drizzle.provider';
import { Block, Transaction, ContractStats } from 'src/database/schema';
import { GetTransactionsQueryDto, GetBlocksQueryDto, GetMultiContractStatsQueryDto, ContractStatsResponseDto } from './scan.dto';

@Injectable()
export class ScanService {
  private readonly logger = new Logger(ScanService.name);
  private readonly contractStatsCache = new Map<string, { count: number; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5분 캐시

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

  // 여러 컨트랙트 주소의 트랜잭션 개수를 병렬로 조회
  async getMultiContractStats(query: GetMultiContractStatsQueryDto) {
    const startTime = Date.now();
    const { contractAddresses, useCache = true } = query;
    
    if (!contractAddresses || contractAddresses.length === 0) {
      return {
        success: false,
        data: [],
        totalTransactions: 0,
        fromCache: false,
        responseTime: Date.now() - startTime,
        error: '컨트랙트 주소가 필요합니다.'
      };
    }

    if (contractAddresses.length > 10) {
      return {
        success: false,
        data: [],
        totalTransactions: 0,
        fromCache: false,
        responseTime: Date.now() - startTime,
        error: '최대 10개의 컨트랙트 주소만 조회 가능합니다.'
      };
    }

    const results: ContractStatsResponseDto[] = [];
    const uncachedAddresses: string[] = [];
    let fromCache = true;

    // 캐시 확인
    if (useCache) {
      for (const address of contractAddresses) {
        const cached = this.contractStatsCache.get(address);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
          results.push({
            contractAddress: address,
            transactionCount: cached.count
          });
        } else {
          uncachedAddresses.push(address);
          fromCache = false;
        }
      }
    } else {
      uncachedAddresses.push(...contractAddresses);
      fromCache = false;
    }

    // 캐시되지 않은 주소들을 병렬로 조회
    if (uncachedAddresses.length > 0) {
      try {
        // 방법 1: 단일 쿼리로 모든 컨트랙트 조회 (가장 빠름)
        const counts = await this.db
          .select({
            contractAddress: Transaction.contractAddress,
            count: count()
          })
          .from(Transaction)
          .where(inArray(Transaction.contractAddress, uncachedAddresses))
          .groupBy(Transaction.contractAddress);

        // 결과 매핑 및 캐시 저장
        for (const address of uncachedAddresses) {
          const found = counts.find(c => c.contractAddress === address);
          const transactionCount = found ? Number(found.count) : 0;
          
          results.push({
            contractAddress: address,
            transactionCount
          });

          // 캐시에 저장
          if (useCache) {
            this.contractStatsCache.set(address, {
              count: transactionCount,
              timestamp: Date.now()
            });
          }
        }

        this.logger.log(`조회 완료: ${uncachedAddresses.length}개 컨트랙트, 소요시간: ${Date.now() - startTime}ms`);
      } catch (error) {
        this.logger.error('다중 컨트랙트 통계 조회 실패:', error);
        
        // 폴백: 개별 쿼리로 시도
        const fallbackResults = await this.getFallbackStats(uncachedAddresses, useCache);
        results.push(...fallbackResults);
      }
    }

    // 결과 정렬 (요청 순서대로)
    const sortedResults = contractAddresses.map(address => 
      results.find(r => r.contractAddress === address) || {
        contractAddress: address,
        transactionCount: 0,
        error: '조회 실패'
      }
    );

    const totalTransactions = sortedResults.reduce((sum, r) => sum + (r.transactionCount || 0), 0);

    return {
      success: true,
      data: sortedResults,
      totalTransactions,
      fromCache,
      responseTime: Date.now() - startTime
    };
  }

  // 통계 테이블을 사용한 초고속 조회
  async getMultiContractStatsFromTable(contractAddresses: string[]) {
    const startTime = Date.now();
    
    try {
      const stats = await this.db
        .select({
          contractAddress: ContractStats.contractAddress,
          transactionCount: ContractStats.transactionCount,
          lastUpdated: ContractStats.lastUpdated,
        })
        .from(ContractStats)
        .where(inArray(ContractStats.contractAddress, contractAddresses));

      // 결과 매핑 (요청 순서대로)
      const results = contractAddresses.map(address => {
        const found = stats.find(s => s.contractAddress === address);
        return {
          contractAddress: address,
          transactionCount: found ? found.transactionCount : 0,
          lastUpdated: found ? found.lastUpdated?.toISOString() : null,
        };
      });

      const totalTransactions = results.reduce((sum, r) => sum + r.transactionCount, 0);

      return {
        success: true,
        data: results,
        totalTransactions,
        fromCache: false,
        responseTime: Date.now() - startTime,
        source: 'stats_table'
      };
    } catch (error) {
      this.logger.error('통계 테이블 조회 실패:', error);
      
      // 폴백: 기존 방식으로 조회
      return this.getMultiContractStats({ contractAddresses, useCache: true });
    }
  }

  // 통계 테이블 업데이트 (백그라운드 작업용)
  async updateContractStats(contractAddresses?: string[]) {
    const startTime = Date.now();
    let updatedCount = 0;

    try {
      // 특정 컨트랙트만 업데이트 또는 전체 업데이트
      let addressesToUpdate: string[];
      
      if (contractAddresses && contractAddresses.length > 0) {
        addressesToUpdate = contractAddresses;
      } else {
        // 모든 고유 컨트랙트 주소 조회
        const allContracts = await this.db
          .selectDistinct({ contractAddress: Transaction.contractAddress })
          .from(Transaction)
          .where(sql`${Transaction.contractAddress} IS NOT NULL AND ${Transaction.contractAddress} != ''`);
        
        addressesToUpdate = allContracts
          .map(c => c.contractAddress)
          .filter((addr): addr is string => addr !== null && addr.trim() !== '');
      }

      // 배치 단위로 처리 (한 번에 너무 많이 처리하지 않도록)
      const batchSize = 50;
      for (let i = 0; i < addressesToUpdate.length; i += batchSize) {
        const batch = addressesToUpdate.slice(i, i + batchSize);
        
        // 각 컨트랙트의 트랜잭션 개수 조회
        const counts = await this.db
          .select({
            contractAddress: Transaction.contractAddress,
            count: count()
          })
          .from(Transaction)
          .where(inArray(Transaction.contractAddress, batch))
          .groupBy(Transaction.contractAddress);

        // 통계 테이블에 UPSERT
        for (const { contractAddress, count: transactionCount } of counts) {
          if (!contractAddress) continue; // null 체크
          
          try {
            await this.db
              .insert(ContractStats)
              .values({
                contractAddress,
                transactionCount: Number(transactionCount),
                lastUpdated: new Date(),
              })
              .onConflictDoUpdate({
                target: ContractStats.contractAddress,
                set: {
                  transactionCount: Number(transactionCount),
                  lastUpdated: new Date(),
                }
              });
            
            updatedCount++;
          } catch (error) {
            this.logger.error(`컨트랙트 ${contractAddress} 통계 업데이트 실패:`, error);
          }
        }

        // 배치 간 짧은 대기 (DB 부하 방지)
        if (i + batchSize < addressesToUpdate.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      const responseTime = Date.now() - startTime;
      this.logger.log(`통계 업데이트 완료: ${updatedCount}개 컨트랙트, 소요시간: ${responseTime}ms`);

      return {
        success: true,
        updatedCount,
        totalContracts: addressesToUpdate.length,
        responseTime,
      };
    } catch (error) {
      this.logger.error('통계 업데이트 실패:', error);
      throw error;
    }
  }

  // 오래된 통계 데이터 정리
  async cleanupOldStats(daysOld = 7) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await this.db
        .delete(ContractStats)
        .where(lt(ContractStats.lastUpdated, cutoffDate));

      const deletedCount = Array.isArray(result) ? result.length : 0;
      this.logger.log(`${daysOld}일 이상 된 통계 데이터 ${deletedCount}개 정리 완료`);
      
      return {
        success: true,
        deletedCount,
      };
    } catch (error) {
      this.logger.error('통계 데이터 정리 실패:', error);
      throw error;
    }
  }

  // 폴백: 개별 쿼리로 조회
  private async getFallbackStats(addresses: string[], useCache: boolean): Promise<ContractStatsResponseDto[]> {
    this.logger.warn('폴백 모드로 개별 쿼리 실행');
    
    const promises = addresses.map(async (address) => {
      try {
        const [result] = await this.db
          .select({ count: count() })
          .from(Transaction)
          .where(eq(Transaction.contractAddress, address));
        
        const transactionCount = Number(result.count);
        
        // 캐시에 저장
        if (useCache) {
          this.contractStatsCache.set(address, {
            count: transactionCount,
            timestamp: Date.now()
          });
        }

        return {
          contractAddress: address,
          transactionCount
        };
      } catch (error) {
        this.logger.error(`컨트랙트 ${address} 조회 실패:`, error);
        return {
          contractAddress: address,
          transactionCount: 0,
          error: '조회 실패'
        };
      }
    });

    return Promise.all(promises);
  }

  // 빠른 근사치 조회 (매우 큰 테이블의 경우)
  async getApproximateMultiContractStats(contractAddresses: string[]) {
    const startTime = Date.now();
    
    try {
      // PostgreSQL의 통계 정보를 사용한 근사치 조회
      const approximateStats = await this.db.execute(sql`
        SELECT 
          t.contract_address,
          COALESCE(
            CASE 
              WHEN s.n_distinct > 0 THEN 
                ROUND((s.reltuples * s.n_distinct) / NULLIF((SELECT COUNT(DISTINCT contract_address) FROM transaction), 0))
              ELSE 0 
            END, 
            0
          ) as approximate_count
        FROM unnest(${contractAddresses}::text[]) as t(contract_address)
        LEFT JOIN (
          SELECT 
            schemaname, tablename, attname, n_distinct,
            c.reltuples
          FROM pg_stats ps
          JOIN pg_class c ON c.relname = ps.tablename
          WHERE ps.schemaname = 'public' 
            AND ps.tablename = 'transaction' 
            AND ps.attname = 'contract_address'
        ) s ON true
      `);

      return {
        success: true,
        data: approximateStats.map((row: any) => ({
          contractAddress: row.contract_address,
          transactionCount: parseInt(row.approximate_count) || 0
        })),
        totalTransactions: approximateStats.reduce((sum: number, row: any) => 
          sum + (parseInt(row.approximate_count) || 0), 0),
        fromCache: false,
        responseTime: Date.now() - startTime,
        isApproximate: true
      };
    } catch (error) {
      this.logger.error('근사치 조회 실패:', error);
      throw error;
    }
  }

  // 캐시 수동 초기화
  clearStatsCache() {
    this.contractStatsCache.clear();
    this.logger.log('통계 캐시가 초기화되었습니다.');
  }

  // 캐시 상태 조회
  getCacheStatus() {
    const now = Date.now();
    const validEntries = Array.from(this.contractStatsCache.entries())
      .filter(([, value]) => now - value.timestamp < this.CACHE_TTL);
    
    return {
      totalEntries: this.contractStatsCache.size,
      validEntries: validEntries.length,
      expiredEntries: this.contractStatsCache.size - validEntries.length
    };
  }
} 