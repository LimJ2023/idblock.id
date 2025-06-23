import { api } from "@/lib/ky-instance";
import { ErrorResponse } from "./common.api";
import { Failure, Success } from "@/lib/utils";
import { HTTPError } from "ky";

// 데이터베이스에서 가져오는 트랜잭션 응답 타입
export interface DbTxResponse {
  success: boolean;
  data: Tx[];
  total?: number;
  page?: number;
  limit?: number;
}

// 트랜잭션 데이터 타입 (데이터베이스 스키마 기반)
export type Tx = {
  id?: number;
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
  methodId?: string;
  functionName?: string;
  createdAt?: string;
  updatedAt?: string;
};

// 트랜잭션 상세 응답 타입
export interface DbTxDetailResponse {
  success: boolean;
  data: TxDetail;
}

export interface TxDetail {
  id?: number;
  nonce: string;
  gasPrice: string;
  gas: string;
  to: string;
  value: string;
  input: string;
  v?: string;
  r?: string;
  s?: string;
  hash: string;
  from: string;
  blockHash: string;
  blockNumber: string;
  transactionIndex: string;
  chainId?: string;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 블록 상세 응답 타입
export interface DbBlockDetailResponse {
  success: boolean;
  data: BlockDetail;
}

export interface BlockDetail {
  id?: number;
  parentHash: string;
  sha3Uncles?: string;
  miner: string;
  stateRoot?: string;
  transactionsRoot?: string;
  receiptsRoot?: string;
  logsBloom?: string;
  difficulty?: string;
  totalDifficulty?: string;
  size?: string;
  number: string;
  gasLimit: string;
  gasUsed: string;
  timestamp: string;
  extraData?: string;
  mixHash?: string;
  nonce?: string;
  hash: string;
  transactions?: Transaction[];
  uncles?: unknown[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Transaction {
  nonce: string;
  gasPrice: string;
  gas: string;
  to: string;
  value: string;
  input: string;
  v?: string;
  r?: string;
  s?: string;
  hash: string;
  from: string;
  blockHash: string;
  blockNumber: string;
  transactionIndex: string;
  chainId?: string;
  type?: string;
}

// 데이터베이스에서 트랜잭션 목록 가져오기
const getTxs: () => Promise<Result<Tx[], ErrorResponse>> = async () => {
  try {
    const requestUrl = "transactions";
    const searchParams = {
      contractAddress: "0x671645FC21615fdcAA332422D5603f1eF9752E03",
      page: "1",
      limit: "100",
      sort: "desc",
    };
    
    console.log("🔍 API 호출 시작:", { requestUrl, searchParams });
    console.log("🌐 Base URL:", "https://manager.idblock.id/api/v1/");
    
    const response = await api
      .get(requestUrl, {
        searchParams,
      })
      .json<DbTxResponse>();

    console.log("✅ API 응답 받음:", response);

    if (!response.success) {
      console.error("❌ API 응답 실패:", response);
      return Failure({
        message: "트랜잭션 데이터를 가져오는데 실패했습니다.",
        error: "API Error",
        statusCode: 400,
      });
    }

    console.log("📊 데이터 개수:", response.data?.length || 0);
    return Success(response.data);
  } catch (e) {
    console.error("🚨 API 호출 에러:", e);
    
    // HTTPError인 경우에만 상세 처리
    if (e instanceof HTTPError) {
      const status = e.response.status;
      console.log(`🔍 HTTP 상태 코드: ${status}`);
      
      // 404 에러인 경우 목업 데이터 반환 (백엔드 엔드포인트 미구현)
      if (status === 404) {
        console.log("🤔 백엔드 엔드포인트가 없습니다. 목업 데이터를 반환합니다.");
        
        // 임시 목업 데이터
        const mockData: Tx[] = [
          {
            id: 1,
            blockNumber: "12345",
            timeStamp: Math.floor(Date.now() / 1000 - 3600).toString(),
            hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
            nonce: "1",
            blockHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            transactionIndex: "0",
            from: "0x742d35Cc6634C0532925a3b8D4C2aDEF7b8aa1D8",
            to: "0x671645FC21615fdcAA332422D5603f1eF9752E03",
            value: "1000000000000000000",
            gas: "21000",
            gasPrice: "20000000000",
            isError: "0",
            txreceipt_status: "1",
            input: "0x",
            contractAddress: "0x671645FC21615fdcAA332422D5603f1eF9752E03",
            cumulativeGasUsed: "21000",
            gasUsed: "21000",
            confirmations: "100",
            methodId: "0x",
            functionName: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 2,
            blockNumber: "12346",
            timeStamp: Math.floor(Date.now() / 1000 - 1800).toString(),
            hash: "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
            nonce: "2",
            blockHash: "0x0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba",
            transactionIndex: "1",
            from: "0x8ba1f109551bD432803012645Hac136c22Ad63e4",
            to: "0x671645FC21615fdcAA332422D5603f1eF9752E03",
            value: "500000000000000000",
            gas: "21000",
            gasPrice: "25000000000",
            isError: "0",
            txreceipt_status: "1",
            input: "0x",
            contractAddress: "0x671645FC21615fdcAA332422D5603f1eF9752E03",
            cumulativeGasUsed: "42000",
            gasUsed: "21000",
            confirmations: "99",
            methodId: "0x",
            functionName: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ];
        
        return Success(mockData);
      }
      
      // 다른 HTTP 에러인 경우
      try {
        const errorResponse = await e.response.json<ErrorResponse>();
        console.error("🚨 HTTP 에러 상세:", errorResponse);
        return Failure(errorResponse);
      } catch (jsonError) {
        console.error("🚨 HTTP 에러 응답 파싱 실패:", jsonError);
        return Failure({
          message: `HTTP ${status} 에러가 발생했습니다.`,
          error: "HTTP Error",
          statusCode: status,
        });
      }
    }
    
    // 네트워크 에러 또는 기타 에러
    console.error("🚨 네트워크 또는 기타 에러:", e);
    return Failure({
      message: "네트워크 연결을 확인해주세요.",
      error: "Network Error",
      statusCode: -1,
    });
  }
};

// 특정 트랜잭션 상세 정보 가져오기
const getTxDetail: (
  h: string,
) => Promise<Result<TxDetail, ErrorResponse>> = async (txHash) => {
  try {
    const response = await api
      .get(`transactions/${txHash}`)
      .json<DbTxDetailResponse>();

    if (!response.success) {
      return Failure({
        message: "트랜잭션 상세 정보를 찾을 수 없습니다.",
        error: "Not Found",
        statusCode: 404,
      });
    }

    return Success(response.data);
  } catch (e) {
    if (e instanceof HTTPError) {
      return Failure(await e.response.json<ErrorResponse>());
    }

    return Failure({
      message: "트랜잭션 상세 정보를 가져오는데 실패했습니다.",
      error: "Database Error",
      statusCode: -1,
    });
  }
};

// 블록 정보 가져오기
const getBlockByNumber: (
  t: string,
) => Promise<Result<BlockDetail, ErrorResponse>> = async (blockNumber) => {
  try {
    const response = await api
      .get(`blocks/${blockNumber}`)
      .json<DbBlockDetailResponse>();

    if (!response.success) {
      return Failure({
        message: "블록 정보를 찾을 수 없습니다.",
        error: "Not Found",
        statusCode: 404,
      });
    }

    return Success(response.data);
  } catch (e) {
    if (e instanceof HTTPError) {
      return Failure(await e.response.json<ErrorResponse>());
    }

    return Failure({
      message: "블록 정보를 가져오는데 실패했습니다.",
      error: "Database Error",
      statusCode: -1,
    });
  }
};

export { getTxs, getTxDetail, getBlockByNumber };
