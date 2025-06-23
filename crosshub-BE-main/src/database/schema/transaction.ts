import {
  bigserial,
  index,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const Transaction = pgTable(
  'transaction',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    blockNumber: text('block_number').notNull(),
    timeStamp: text('time_stamp').notNull(),
    hash: text().unique().notNull(),
    nonce: text(),
    blockHash: text('block_hash'),
    transactionIndex: text('transaction_index'),
    fromAddress: text('from_address').notNull(),
    toAddress: text('to_address'),
    value: text().default('0'),
    gas: text(),
    gasPrice: text('gas_price'),
    isError: text('is_error').default('0'),
    txreceiptStatus: text('txreceipt_status'),
    input: text(),
    contractAddress: text('contract_address'),
    cumulativeGasUsed: text('cumulative_gas_used'),
    gasUsed: text('gas_used'),
    confirmations: text(),
    methodId: text('method_id'),
    functionName: text('function_name'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => {
    return {
      idxTransactionsContractAddress: index('idx_transactions_contract_address').on(
        table.contractAddress,
      ),
      idxTransactionsHash: index('idx_transactions_hash').on(table.hash),
      idxTransactionsBlockNumber: index('idx_transactions_block_number').on(
        table.blockNumber,
      ),
    };
  },
);

export type TransactionSelect = typeof Transaction.$inferSelect;
export type TransactionInsert = typeof Transaction.$inferInsert; 