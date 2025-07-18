import {
  bigserial,
  index,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const Block = pgTable(
  'block',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    number: text().unique().notNull(),
    hash: text().unique().notNull(),
    parentHash: text('parent_hash'),
    miner: text(),
    timestamp: text().notNull(),
    gasLimit: text('gas_limit'),
    gasUsed: text('gas_used'),
    size: text(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => {
    return {
      idxBlocksNumber: index('idx_blocks_number').on(table.number),
      // timestamp 정렬 성능 개선을 위한 인덱스 추가
      idxBlocksTimestamp: index('idx_blocks_timestamp').on(table.timestamp),
    };
  },
);

export type BlockSelect = typeof Block.$inferSelect;
export type BlockInsert = typeof Block.$inferInsert; 