# 🚀 블록체인 대용량 데이터 삽입 가이드

## 개요

이 스크립트는 테스트 목적으로 PostgreSQL 데이터베이스에 480,000개의 블록체인 트랜잭션 데이터를 삽입합니다.

## 📋 데이터 특성

- **기간**: 2024년 11월 ~ 2025년 6월 (8개월)
- **총 트랜잭션**: 480,000개
- **총 블록**: 약 12,000개 (블록당 20~80개 트랜잭션)
- **피크 시기**: 2025년 1월 (가장 많은 데이터 분포)
- **데이터 분포**: 정규분포 기반으로 2025년 1월에 피크

## 🛠️ 사전 준비

### 1. 데이터베이스 마이그레이션 실행

```bash
# PostgreSQL에서 테이블 생성
psql -U your_username -d your_database -f src/database/migrations/0001_create_blockchain_tables.sql
```

### 2. 환경 변수 설정

`.env` 파일에 다음 내용이 설정되어 있는지 확인:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

## 🚀 실행 방법

### 스크립트 실행

```bash
# pnpm 사용
pnpm run insert-bulk-blockchain-data

# npm 사용
npm run insert-bulk-blockchain-data

# yarn 사용
yarn insert-bulk-blockchain-data
```

## 📊 실행 과정

스크립트 실행 시 다음과 같은 정보가 표시됩니다:

```
🚀 대용량 블록체인 데이터 삽입 시작...
📊 조건:
  - 기간: 2024년 11월 ~ 2025년 6월
  - 피크: 2025년 1월
  - 총 데이터: 480,000개 트랜잭션

📈 진행률: 12.5% (60,000/480,000) | 경과시간: 45초 | 예상완료: 315초
...
✅ 데이터 삽입 완료!
📊 통계:
  - 총 트랜잭션: 480,000개
  - 총 블록: 12,000개
  - 소요시간: 360초
  - 초당 처리량: 1,333개/초
```

## 🎯 생성되는 데이터 유형

### 트랜잭션 데이터

- **일반 전송**: ETH 전송 트랜잭션 (70%)
- **컨트랙트 호출**: 스마트 컨트랙트 상호작용 (30%)
- **에러 트랜잭션**: 실패한 트랜잭션 (2%)
- **가스비**: 10-210 Gwei 범위
- **전송량**: 0.001-100 ETH 범위

### 블록 데이터

- **블록 번호**: 18,500,000부터 시작
- **가스 한도**: 5M-20M 범위
- **블록 크기**: 10KB-110KB 범위
- **마이너**: 랜덤 주소

### 포함된 컨트랙트

- `0x671645FC21615fdcAA332422D5603f1eF9752E03` (요청 주소)
- USDC, DAI, USDT, MATIC, LINK, WBTC, WETH 등

### 함수 호출

- `transfer`, `approve`, `transferFrom`
- `mint`, `burn`, `swap`
- `addLiquidity`, `removeLiquidity`
- `stake`, `unstake`, `claim`
- `deposit`, `withdraw`, `vote`, `delegate`

## ⚡ 성능 최적화

### 배치 처리

- **배치 크기**: 1,000개씩 처리
- **중복 방지**: `onConflictDoNothing` 사용
- **인덱스**: 자동으로 인덱스 생성하여 검색 성능 향상

### 예상 실행 시간

- **소규모 서버**: 10-15분
- **중간 성능 서버**: 5-8분
- **고성능 서버**: 2-4분

## 📈 데이터 분포 확인

삽입 완료 후 다음 SQL로 데이터 분포를 확인할 수 있습니다:

```sql
-- 월별 트랜잭션 수 확인
SELECT
  DATE_TRUNC('month', TO_TIMESTAMP(time_stamp::bigint)) as month,
  COUNT(*) as transaction_count
FROM transaction
GROUP BY month
ORDER BY month;

-- 컨트랙트별 트랜잭션 수 확인
SELECT
  contract_address,
  COUNT(*) as count
FROM transaction
WHERE contract_address IS NOT NULL
GROUP BY contract_address
ORDER BY count DESC;

-- 에러 트랜잭션 비율 확인
SELECT
  is_error,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM transaction
GROUP BY is_error;
```

## 🔧 문제 해결

### 메모리 부족 오류

배치 크기를 줄이려면 스크립트에서 `BATCH_SIZE` 값을 수정:

```typescript
const BATCH_SIZE = 500; // 기본값: 1000
```

### 데이터베이스 연결 오류

- `.env` 파일의 `DATABASE_URL` 확인
- PostgreSQL 서버 실행 상태 확인
- 데이터베이스 권한 확인

### 중복 데이터 오류

스크립트는 자동으로 중복을 처리하므로 여러 번 실행해도 안전합니다.

## 🧹 데이터 정리

테스트 완료 후 데이터를 삭제하려면:

```sql
-- 모든 트랜잭션 데이터 삭제
DELETE FROM transaction;

-- 모든 블록 데이터 삭제
DELETE FROM block;

-- 시퀀스 리셋
ALTER SEQUENCE transaction_id_seq RESTART WITH 1;
ALTER SEQUENCE block_id_seq RESTART WITH 1;
```

## 📝 주의사항

1. **프로덕션 환경 주의**: 이 스크립트는 테스트 목적으로만 사용하세요.
2. **디스크 공간**: 약 2-3GB의 디스크 공간이 필요합니다.
3. **네트워크 부하**: 대량 데이터 삽입으로 인한 DB 서버 부하를 고려하세요.
4. **백업**: 실행 전 데이터베이스 백업을 권장합니다.
