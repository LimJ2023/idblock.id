# Scan Module

## 개요

Blockchain 트랜잭션 및 블록 데이터를 관리하는 모듈입니다. PostgreSQL 데이터베이스에 저장된 트랜잭션 및 블록 정보를 조회할 수 있는 REST API를 제공합니다.

## API 엔드포인트

### 1. 트랜잭션 목록 조회

```
GET /api/v1/transactions
```

**Query Parameters:**

- `contractAddress` (optional): 컨트랙트 주소
- `page` (optional): 페이지 번호 (기본값: 1)
- `limit` (optional): 페이지당 항목 수 (기본값: 100)
- `sort` (optional): 정렬 순서 ("desc" | "asc", 기본값: "desc")

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "blockNumber": "12345",
      "timeStamp": "1640995200",
      "hash": "0x...",
      "fromAddress": "0x...",
      "toAddress": "0x...",
      "value": "1000000000000000000",
      "gasUsed": "21000"
      // ... 기타 필드
    }
  ],
  "total": 1000,
  "page": 1,
  "limit": 100
}
```

### 2. 트랜잭션 상세 조회

```
GET /api/v1/transactions/:hash
```

**Parameters:**

- `hash`: 트랜잭션 해시

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "hash": "0x...",
    "blockNumber": "12345",
    "fromAddress": "0x...",
    "toAddress": "0x..."
    // ... 상세 필드
  }
}
```

### 3. 블록 정보 조회

```
GET /api/v1/blocks/:blockNumber
```

**Parameters:**

- `blockNumber`: 블록 번호

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "number": "12345",
    "hash": "0x...",
    "timestamp": "1640995200",
    "gasUsed": "8000000"
    // ... 기타 필드
  }
}
```

## 데이터베이스 스키마

### Transaction 테이블

- `id`: BIGSERIAL PRIMARY KEY
- `block_number`: TEXT NOT NULL
- `time_stamp`: TEXT NOT NULL
- `hash`: TEXT UNIQUE NOT NULL
- `from_address`: TEXT NOT NULL
- `to_address`: TEXT
- `value`: TEXT DEFAULT '0'
- `contract_address`: TEXT
- `gas_used`: TEXT
- 기타 블록체인 관련 필드들

### Block 테이블

- `id`: BIGSERIAL PRIMARY KEY
- `number`: TEXT UNIQUE NOT NULL
- `hash`: TEXT UNIQUE NOT NULL
- `timestamp`: TEXT NOT NULL
- `gas_limit`: TEXT
- `gas_used`: TEXT
- 기타 블록 관련 필드들

## 인덱스

효율적인 쿼리를 위해 다음 인덱스가 생성됩니다:

- `idx_transactions_contract_address`: 컨트랙트 주소 검색
- `idx_transactions_hash`: 트랜잭션 해시 검색
- `idx_transactions_block_number`: 블록 번호 검색
- `idx_blocks_number`: 블록 번호 검색

## 사용 예시

### 특정 컨트랙트의 트랜잭션 조회

```bash
curl "http://localhost:3000/api/v1/transactions?contractAddress=0x671645FC21615fdcAA332422D5603f1eF9752E03&page=1&limit=50"
```

### 트랜잭션 상세 정보 조회

```bash
curl "http://localhost:3000/api/v1/transactions/0x1234567890abcdef..."
```

### 블록 정보 조회

```bash
curl "http://localhost:3000/api/v1/blocks/12345"
```

## 데이터 삽입

ScanService는 외부 API에서 데이터를 가져와 저장할 수 있는 메서드들도 제공합니다:

- `insertTransaction()`: 단일 트랜잭션 삽입
- `insertTransactions()`: 다중 트랜잭션 일괄 삽입
- `insertBlock()`: 단일 블록 삽입
- `insertBlocks()`: 다중 블록 일괄 삽입

모든 삽입 메서드는 중복 데이터에 대해 `onConflictDoNothing` 처리됩니다.
