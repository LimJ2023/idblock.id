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
    };
  },
);

export type BlockSelect = typeof Block.$inferSelect;
export type BlockInsert = typeof Block.$inferInsert; 