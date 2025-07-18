-- 트랜잭션 성능 최적화를 위한 인덱스 생성

-- timeStamp 정렬 성능 개선을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_transactions_time_stamp ON transaction (time_stamp);

-- contractAddress와 timeStamp 복합 인덱스 (필터링 + 정렬)
CREATE INDEX IF NOT EXISTS idx_transactions_contract_address_time_stamp ON transaction (contract_address, time_stamp);

-- 블록 timestamp 인덱스
CREATE INDEX IF NOT EXISTS idx_blocks_timestamp ON block (timestamp); 
