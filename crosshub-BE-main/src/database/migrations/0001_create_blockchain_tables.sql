-- 트랜잭션 테이블 생성
CREATE TABLE IF NOT EXISTS "transaction" (
  "id" BIGSERIAL PRIMARY KEY,
  "block_number" TEXT NOT NULL,
  "time_stamp" TEXT NOT NULL,
  "hash" TEXT UNIQUE NOT NULL,
  "nonce" TEXT,
  "block_hash" TEXT,
  "transaction_index" TEXT,
  "from_address" TEXT NOT NULL,
  "to_address" TEXT,
  "value" TEXT DEFAULT '0',
  "gas" TEXT,
  "gas_price" TEXT,
  "is_error" TEXT DEFAULT '0',
  "txreceipt_status" TEXT,
  "input" TEXT,
  "contract_address" TEXT,
  "cumulative_gas_used" TEXT,
  "gas_used" TEXT,
  "confirmations" TEXT,
  "method_id" TEXT,
  "function_name" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 블록 테이블 생성
CREATE TABLE IF NOT EXISTS "block" (
  "id" BIGSERIAL PRIMARY KEY,
  "number" TEXT UNIQUE NOT NULL,
  "hash" TEXT UNIQUE NOT NULL,
  "parent_hash" TEXT,
  "miner" TEXT,
  "timestamp" TEXT NOT NULL,
  "gas_limit" TEXT,
  "gas_used" TEXT,
  "size" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS "idx_transactions_contract_address" ON "transaction" ("contract_address");
CREATE INDEX IF NOT EXISTS "idx_transactions_hash" ON "transaction" ("hash");
CREATE INDEX IF NOT EXISTS "idx_transactions_block_number" ON "transaction" ("block_number");
CREATE INDEX IF NOT EXISTS "idx_blocks_number" ON "block" ("number");

-- 업데이트 트리거 함수 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 업데이트 트리거 생성
CREATE TRIGGER update_transaction_updated_at BEFORE UPDATE ON "transaction"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_block_updated_at BEFORE UPDATE ON "block"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 