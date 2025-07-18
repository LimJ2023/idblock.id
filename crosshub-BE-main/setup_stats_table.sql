-- 컨트랙트 통계 테이블 생성
CREATE TABLE IF NOT EXISTS contract_stats (
  id BIGSERIAL PRIMARY KEY,
  contract_address TEXT UNIQUE NOT NULL,
  transaction_count INTEGER DEFAULT 0 NOT NULL,
  last_updated TIMESTAMP DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_contract_stats_address ON contract_stats (contract_address);
CREATE INDEX IF NOT EXISTS idx_contract_stats_last_updated ON contract_stats (last_updated); 
