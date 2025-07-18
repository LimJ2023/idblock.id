-- 성능 최적화를 위한 추가 인덱스 생성 스크립트
-- 기존 인덱스 확인: \d transaction
-- 실행 전 현재 인덱스 상태를 확인하고 필요한 것만 추가

-- 1. 트랜잭션 테이블 최적화
-- timeStamp 기반 정렬 성능 개선 (DESC 정렬에 최적화)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_timestamp_desc 
ON transaction (time_stamp DESC);

-- contractAddress + timeStamp 복합 인덱스 최적화 (이미 있지만 순서 최적화)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_contract_timestamp_desc 
ON transaction (contract_address, time_stamp DESC);

-- 자주 사용되는 필터 조건 최적화
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_error_status 
ON transaction (is_error) WHERE is_error = '1';

-- 가스 사용량 기반 조회 최적화
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_gas_used 
ON transaction (gas_used DESC) WHERE gas_used IS NOT NULL;

-- 2. 블록 테이블 최적화
-- timestamp 기반 정렬 성능 개선
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blocks_timestamp_desc 
ON block (timestamp DESC);

-- 블록 번호 범위 조회 최적화
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blocks_number_range 
ON block (number DESC);

-- 3. 통계 쿼리 최적화
-- 특정 컨트랙트의 트랜잭션 수 빠른 계산
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_contract_count 
ON transaction (contract_address) WHERE contract_address IS NOT NULL;

-- 4. 커서 기반 페이지네이션 최적화
-- timeStamp 범위 조회 최적화
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_timestamp_range 
ON transaction (time_stamp) WHERE time_stamp IS NOT NULL;

-- 5. 부분 인덱스 (선택사항)
-- 성공한 트랜잭션만 인덱싱 (대부분의 조회가 성공한 트랜잭션 대상)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_success_only 
ON transaction (contract_address, time_stamp DESC) 
WHERE is_error = '0' AND txreceipt_status = '1';

-- 6. 인덱스 사용률 모니터링을 위한 쿼리
-- 인덱스 사용 통계 확인
/*
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE tablename IN ('transaction', 'block')
ORDER BY idx_scan DESC;
*/

-- 7. 테이블 통계 업데이트 (선택사항)
-- 쿼리 플래너가 최적의 실행 계획을 수립할 수 있도록 통계 업데이트
ANALYZE transaction;
ANALYZE block;

-- 8. 성능 확인 쿼리
-- 실행 계획 확인 예시
/*
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM transaction 
WHERE contract_address = '0x671645FC21615fdcAA332422D5603f1eF9752E03' 
ORDER BY time_stamp::bigint DESC 
LIMIT 10;
*/

-- 주의사항:
-- 1. CONCURRENTLY 옵션은 테이블 잠금 없이 인덱스를 생성하지만 시간이 오래 걸릴 수 있음
-- 2. 인덱스가 많을수록 INSERT/UPDATE 성능이 저하될 수 있음
-- 3. 실제 사용 패턴을 모니터링하여 불필요한 인덱스는 제거 권장
-- 4. 인덱스 생성 전후 쿼리 성능을 측정하여 효과 확인 