import {
  bigserial,
  index,
  pgTable,
  text,
  timestamp,
  integer,
  unique,
} from 'drizzle-orm/pg-core';

export const ContractStats = pgTable(
  'contract_stats',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    contractAddress: text('contract_address').notNull(),
    transactionCount: integer('transaction_count').default(0).notNull(),
    lastUpdated: timestamp('last_updated').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      // 컨트랙트 주소별 유니크 제약
      contractAddressUnique: unique('contract_address_unique').on(table.contractAddress),
      // 컨트랙트 주소 인덱스
      idxContractStatsAddress: index('idx_contract_stats_address').on(table.contractAddress),
      // 업데이트 시간 인덱스
      idxContractStatsLastUpdated: index('idx_contract_stats_last_updated').on(table.lastUpdated),
    };
  },
);

export type ContractStatsSelect = typeof ContractStats.$inferSelect;
export type ContractStatsInsert = typeof ContractStats.$inferInsert; 