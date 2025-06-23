# GXCE Admin

## Install step

```bash
$ git clone https://github.com/butter-soft/gesia-exchange-admin-FE my-app
$ cd my-app
$ pnpm i
$ pnpm dev    # Dev server with HMR
$ pnpm build  # Prooduction build, outputs in /dist
```

## 📊 데이터베이스 API 엔드포인트

프론트엔드에서 PostgreSQL 데이터베이스의 트랜잭션 데이터를 사용하기 위해 다음 API 엔드포인트들이 백엔드에 구현되어야 합니다:

### 트랜잭션 관련 API

#### 1. 트랜잭션 목록 조회

```
GET /api/v1/transactions
Query Parameters:
  - contractAddress: string (예: "0x671645FC21615fdcAA332422D5603f1eF9752E03")
  - page: string (기본값: "1")
  - limit: string (기본값: "100")
  - sort: string ("desc" | "asc", 기본값: "desc")

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "blockNumber": "12345",
      "timeStamp": "1640995200",
      "hash": "0x...",
      "from": "0x...",
      "to": "0x...",
      "value": "1000000000000000000",
      "gasUsed": "21000",
      // ... 기타 필드
    }
  ],
  "total": 1000,
  "page": 1,
  "limit": 100
}
```

#### 2. 트랜잭션 상세 조회

```
GET /api/v1/transactions/:hash

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "hash": "0x...",
    "blockNumber": "12345",
    "from": "0x...",
    "to": "0x...",
    // ... 상세 필드
  }
}
```

#### 3. 블록 정보 조회

```
GET /api/v1/blocks/:blockNumber

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "number": "12345",
    "hash": "0x...",
    "timestamp": "1640995200",
    "gasUsed": "8000000",
    // ... 기타 필드
  }
}
```

### 데이터베이스 스키마 예시

PostgreSQL 테이블 구조:

```sql
-- 트랜잭션 테이블
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  block_number VARCHAR(100) NOT NULL,
  time_stamp VARCHAR(100) NOT NULL,
  hash VARCHAR(100) UNIQUE NOT NULL,
  nonce VARCHAR(100),
  block_hash VARCHAR(100),
  transaction_index VARCHAR(100),
  from_address VARCHAR(100) NOT NULL,
  to_address VARCHAR(100),
  value VARCHAR(100) DEFAULT '0',
  gas VARCHAR(100),
  gas_price VARCHAR(100),
  is_error VARCHAR(10) DEFAULT '0',
  txreceipt_status VARCHAR(10),
  input TEXT,
  contract_address VARCHAR(100),
  cumulative_gas_used VARCHAR(100),
  gas_used VARCHAR(100),
  confirmations VARCHAR(100),
  method_id VARCHAR(100),
  function_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 블록 테이블
CREATE TABLE blocks (
  id SERIAL PRIMARY KEY,
  number VARCHAR(100) UNIQUE NOT NULL,
  hash VARCHAR(100) UNIQUE NOT NULL,
  parent_hash VARCHAR(100),
  miner VARCHAR(100),
  timestamp VARCHAR(100) NOT NULL,
  gas_limit VARCHAR(100),
  gas_used VARCHAR(100),
  size VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_transactions_contract_address ON transactions(contract_address);
CREATE INDEX idx_transactions_hash ON transactions(hash);
CREATE INDEX idx_transactions_block_number ON transactions(block_number);
CREATE INDEX idx_blocks_number ON blocks(number);
```

### 백엔드 구현 예시 (Node.js + Express + PostgreSQL)

```javascript
// transactions.controller.js
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// 트랜잭션 목록 조회
exports.getTransactions = async (req, res) => {
  try {
    const { contractAddress, page = 1, limit = 100, sort = "desc" } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT * FROM transactions 
      WHERE contract_address = $1 
      ORDER BY time_stamp ${sort.toUpperCase()} 
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [contractAddress, limit, offset]);

    // 총 개수 조회
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM transactions WHERE contract_address = $1",
      [contractAddress],
    );

    res.json({
      success: true,
      data: result.rows.map(mapDbRowToTx),
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("트랜잭션 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "트랜잭션 데이터를 가져오는데 실패했습니다.",
    });
  }
};

// 트랜잭션 상세 조회
exports.getTransactionDetail = async (req, res) => {
  try {
    const { hash } = req.params;

    const result = await pool.query(
      "SELECT * FROM transactions WHERE hash = $1",
      [hash],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "트랜잭션을 찾을 수 없습니다.",
      });
    }

    res.json({
      success: true,
      data: mapDbRowToTxDetail(result.rows[0]),
    });
  } catch (error) {
    console.error("트랜잭션 상세 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "트랜잭션 상세 정보를 가져오는데 실패했습니다.",
    });
  }
};

// DB 컬럼명을 프론트엔드 형식으로 변환
function mapDbRowToTx(row) {
  return {
    id: row.id,
    blockNumber: row.block_number,
    timeStamp: row.time_stamp,
    hash: row.hash,
    nonce: row.nonce,
    blockHash: row.block_hash,
    transactionIndex: row.transaction_index,
    from: row.from_address,
    to: row.to_address,
    value: row.value,
    gas: row.gas,
    gasPrice: row.gas_price,
    isError: row.is_error,
    txreceipt_status: row.txreceipt_status,
    input: row.input,
    contractAddress: row.contract_address,
    cumulativeGasUsed: row.cumulative_gas_used,
    gasUsed: row.gas_used,
    confirmations: row.confirmations,
    methodId: row.method_id,
    functionName: row.function_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
```

이제 프론트엔드에서 Polygon API 대신 백엔드 데이터베이스 API를 호출하여 트랜잭션 데이터를 가져오게 됩니다.
