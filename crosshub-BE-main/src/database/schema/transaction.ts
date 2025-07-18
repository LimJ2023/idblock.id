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
      // timeStamp 정렬 성능 개선을 위한 인덱스 추가
      idxTransactionsTimeStamp: index('idx_transactions_time_stamp').on(
        table.timeStamp,
      ),
      // contractAddress와 timeStamp 복합 인덱스 (필터링 + 정렬)
      idxTransactionsContractAddressTimeStamp: index('idx_transactions_contract_address_time_stamp').on(
        table.contractAddress,
        table.timeStamp,
      ),
    };
  },
);

export type TransactionSelect = typeof Transaction.$inferSelect;
export type TransactionInsert = typeof Transaction.$inferInsert; 