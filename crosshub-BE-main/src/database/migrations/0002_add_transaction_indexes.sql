-- 트랜잭션 성능 최적화를 위한 인덱스 추가

-- timeStamp 정렬 성능 개선을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_transactions_time_stamp ON transaction (time_stamp);

-- contractAddress와 timeStamp 복합 인덱스 (필터링 + 정렬)
CREATE INDEX IF NOT EXISTS idx_transactions_contract_address_time_stamp ON transaction (contract_address, time_stamp);

-- 기존 인덱스가 없다면 추가 (안전장치)
CREATE INDEX IF NOT EXISTS idx_transactions_contract_address ON transaction (contract_address);
CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transaction (hash);
CREATE INDEX IF NOT EXISTS idx_transactions_block_number ON transaction (block_number);

-- 블록 테이블 인덱스도 추가
CREATE INDEX IF NOT EXISTS idx_blocks_timestamp ON block (timestamp); 