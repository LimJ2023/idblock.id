import { api } from "@/lib/ky-instance";
import { ErrorResponse } from "./common.api";
import { Failure, Success } from "@/lib/utils";
import { HTTPError } from "ky";

// 데이터베이스에서 가져오는 트랜잭션 응답 타입
export interface DbTxResponse {
  success: boolean;
  data: DbTx[];
  total?: number;
  page?: number;
  limit?: number;
}

// 프론트엔드용 변환된 트랜잭션 응답 타입
export interface TxResponse {
  success: boolean;
  data: Tx[];
  total?: number;
  page?: number;
  limit?: number;
}

// DB 데이터를 프론트엔드 형식으로 변환하는 함수
function transformDbTxToTx(dbTx: DbTx): Tx {
  console.log("🔄 변환 전 DB 데이터:", dbTx);
  
  const transformed = {
    id: dbTx.id,
    blockNumber: dbTx.blockNumber,
    timeStamp: dbTx.timeStamp,
    hash: dbTx.hash,
    nonce: dbTx.nonce,
    blockHash: dbTx.blockHash,
    transactionIndex: dbTx.transactionIndex,
    from: dbTx.fromAddress,
    to: dbTx.toAddress,
    value: dbTx.value,
    gas: dbTx.gas,
    gasPrice: dbTx.gasPrice,
    isError: dbTx.isError,
    txreceipt_status: dbTx.txreceiptStatus,
    input: dbTx.input,
    contractAddress: dbTx.contractAddress,
    cumulativeGasUsed: dbTx.cumulativeGasUsed,
    gasUsed: dbTx.gasUsed,
    confirmations: dbTx.confirmations,
    methodId: dbTx.methodId,
    functionName: dbTx.functionName,
    createdAt: dbTx.createdAt,
    updatedAt: dbTx.updatedAt,
  };
  
  console.log("✅ 변환 후 데이터:", transformed);
  return transformed;
}

// 트랜잭션 데이터 타입 (데이터베이스에서 실제로 오는 camelCase 형식)
export type DbTx = {
  id?: string;
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  fromAddress: string;
  toAddress: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceiptStatus: string;
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

// 프론트엔드용 변환된 트랜잭션 데이터 타입
export type Tx = {
  id?: string;
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
let isRequestInProgress = false;

interface GetTxsParams {
  page?: number;
  limit?: number;
  contractAddress?: string;
}

const getTxs: (params?: GetTxsParams) => Promise<Result<TxResponse, ErrorResponse>> = async (params = {}) => {
  // 이미 요청 중인 경우 대기
  if (isRequestInProgress) {
    console.log("⏳ 이미 요청 진행 중입니다. 대기...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (isRequestInProgress) {
      console.log("⚠️ 요청이 너무 오래 걸립니다. 새로운 요청을 시작합니다.");
    }
  }

  isRequestInProgress = true;
  
  try {
    const requestUrl = "transactions";
    const searchParams = {
      contractAddress: params.contractAddress || "0x671645FC21615fdcAA332422D5603f1eF9752E03",
      page: (params.page || 1).toString(),
      limit: (params.limit || 10).toString(),
      sort: "desc",
    };
    
    const startTime = Date.now();
    console.log("🔍 API 호출 시작:", { 
      requestUrl, 
      searchParams, 
      timestamp: new Date().toISOString() 
    });
    
    const response = await api
      .get(requestUrl, {
        searchParams,
      })
      .json<{data: DbTxResponse}>();

    const endTime = Date.now();
    console.log("✅ API 응답 받음:", { 
      response, 
      duration: `${endTime - startTime}ms`,
      timestamp: new Date().toISOString()
    });

    // 실제 응답 데이터는 response.data에 있음
    const actualResponse = response.data;
    
    console.log("🔍 실제 응답 데이터:", {
      "실제 응답": actualResponse,
      "success": actualResponse.success,
      "데이터 개수": actualResponse.data?.length || 0,
      "total": actualResponse.total,
      "page": actualResponse.page,
      "limit": actualResponse.limit
    });

    if (!actualResponse.success) {
      console.error("❌ API 응답 실패:", actualResponse);
      return Failure({
        message: "트랜잭션 데이터를 가져오는데 실패했습니다.",
        error: "API Error",
        statusCode: 400,
      });
    }

    // 실제 DB 응답 데이터 구조 확인
    console.log("🔍 실제 DB 응답 데이터 샘플:", actualResponse.data?.[0]);
    
    // DB 데이터를 프론트엔드 형식으로 변환
    const transformedData: Tx[] = actualResponse.data?.map(transformDbTxToTx) || [];
    
    const transformedResponse: TxResponse = {
      success: actualResponse.success,
      data: transformedData,
      total: actualResponse.total,
      page: actualResponse.page,
      limit: actualResponse.limit,
    };

    console.log("📊 변환된 데이터 개수:", transformedData.length);
    console.log("🔍 변환된 데이터 첫 번째 샘플:", transformedData[0]);
    return Success(transformedResponse);
  } catch (e) {
    console.error("🚨 API 호출 에러:", e);
    
    // HTTPError인 경우에만 상세 처리
    if (e instanceof HTTPError) {
      const status = e.response.status;
      console.log(`🔍 HTTP 상태 코드: ${status}`);
      
      // 404 에러인 경우 목업 데이터 반환 (백엔드 엔드포인트 미구현)
      if (status === 404) {
        console.log("🤔 백엔드 엔드포인트가 없습니다. 목업 데이터를 반환합니다.");
        
        // 임시 목업 데이터 (DB 스키마 형식)
        const mockDbTxs: DbTx[] = [
          {
            id: "1",
            blockNumber: "12345",
            timeStamp: Math.floor(Date.now() / 1000 - 3600).toString(),
            hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
            nonce: "1",
            blockHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            transactionIndex: "0",
            fromAddress: "0x742d35Cc6634C0532925a3b8D4C2aDEF7b8aa1D8",
            toAddress: "0x671645FC21615fdcAA332422D5603f1eF9752E03",
            value: "1000000000000000000",
            gas: "21000",
            gasPrice: "20000000000",
            isError: "0",
            txreceiptStatus: "1",
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
            id: "2",
            blockNumber: "12346",
            timeStamp: Math.floor(Date.now() / 1000 - 1800).toString(),
            hash: "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
            nonce: "2",
            blockHash: "0x0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba",
            transactionIndex: "1",
            fromAddress: "0x8ba1f109551bD432803012645Hac136c22Ad63e4",
            toAddress: "0x671645FC21615fdcAA332422D5603f1eF9752E03",
            value: "500000000000000000",
            gas: "21000",
            gasPrice: "25000000000",
            isError: "0",
            txreceiptStatus: "1",
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

        // DB 데이터를 프론트엔드 형식으로 변환
        const transformedMockData: Tx[] = mockDbTxs.map(transformDbTxToTx);
        
        // 목업 응답 생성 (페이지네이션 정보 포함)
        const mockResponse: TxResponse = {
          success: true,
          data: transformedMockData,
          total: 1000, // 전체 트랜잭션 수 (목업)
          page: params.page || 1,
          limit: params.limit || 10,
        };
        
        return Success(mockResponse);
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
  } finally {
    isRequestInProgress = false;
    console.log("🏁 API 요청 완료");
  }
};

// 특정 트랜잭션 상세 정보 가져오기
const getTxDetail: (
  h: string,
) => Promise<Result<TxDetail, ErrorResponse>> = async (txHash) => {
  try {
    console.log("🔍 트랜잭션 상세 정보 요청:", { txHash });
    
    const response = await api
      .get(`transactions/${txHash}`)
      .json<{data: DbTxDetailResponse}>();

    console.log("✅ 트랜잭션 상세 응답:", response);

    // 실제 응답 데이터는 response.data에 있음
    const actualResponse = response.data;
    
    console.log("🔍 실제 트랜잭션 응답 데이터:", {
      "실제 응답": actualResponse,
      "success": actualResponse.success,
      "데이터": actualResponse.data
    });

    if (!actualResponse.success) {
      return Failure({
        message: "트랜잭션 상세 정보를 찾을 수 없습니다.",
        error: "Not Found",
        statusCode: 404,
      });
    }

    return Success(actualResponse.data);
  } catch (e) {
    console.error("🚨 트랜잭션 상세 API 에러:", e);
    
    if (e instanceof HTTPError) {
      const status = e.response.status;
      console.log(`🔍 트랜잭션 상세 HTTP 상태 코드: ${status}`);
      
      // 404 에러인 경우 목업 데이터 반환 (백엔드 엔드포인트 미구현)
      if (status === 404) {
        console.log("🤔 트랜잭션 상세 백엔드 엔드포인트가 없습니다. 목업 데이터를 반환합니다.");
        
        // 트랜잭션 해시를 기반으로 목업 데이터 생성
        const mockTxDetail: TxDetail = {
          id: Math.floor(Math.random() * 1000),
          nonce: "1",
          gasPrice: "20000000000",
          gas: "21000",
          to: "0x671645FC21615fdcAA332422D5603f1eF9752E03",
          value: "1000000000000000000",
          input: "0x",
          hash: txHash, // 실제 요청한 해시 사용
          from: "0x742d35Cc6634C0532925a3b8D4C2aDEF7b8aa1D8",
          blockHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
          blockNumber: "12345",
          transactionIndex: "0",
          chainId: "137", // Polygon 체인 ID
          type: "0x2",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        return Success(mockTxDetail);
      }
      
             // 다른 HTTP 에러인 경우
       try {
         const errorResponse = await e.response.json<ErrorResponse>();
         return Failure(errorResponse);
       } catch {
         return Failure({
           message: `HTTP ${status} 에러가 발생했습니다.`,
           error: "HTTP Error",
           statusCode: status,
         });
       }
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
    console.log("🔍 블록 정보 요청:", { blockNumber });
    
    const response = await api
      .get(`blocks/${blockNumber}`)
      .json<{data: DbBlockDetailResponse}>();

    console.log("✅ 블록 정보 응답:", response);

    // 실제 응답 데이터는 response.data에 있음
    const actualResponse = response.data;
    
    console.log("🔍 실제 블록 응답 데이터:", {
      "실제 응답": actualResponse,
      "success": actualResponse.success,
      "데이터": actualResponse.data
    });

    if (!actualResponse.success) {
      return Failure({
        message: "블록 정보를 찾을 수 없습니다.",
        error: "Not Found",
        statusCode: 404,
      });
    }

    return Success(actualResponse.data);
  } catch (e) {
    console.error("🚨 블록 정보 API 에러:", e);
    
    if (e instanceof HTTPError) {
      const status = e.response.status;
      console.log(`🔍 블록 정보 HTTP 상태 코드: ${status}`);
      
      // 404 에러인 경우 목업 데이터 반환 (백엔드 엔드포인트 미구현)
      if (status === 404) {
        console.log("🤔 블록 정보 백엔드 엔드포인트가 없습니다. 목업 데이터를 반환합니다.");
        
        // 블록 번호를 기반으로 목업 데이터 생성
        const mockBlockDetail: BlockDetail = {
          id: Math.floor(Math.random() * 1000),
          parentHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          miner: "0x742d35Cc6634C0532925a3b8D4C2aDEF7b8aa1D8",
          number: blockNumber, // 실제 요청한 블록 번호 사용
          gasLimit: "30000000",
          gasUsed: "21000",
          timestamp: Math.floor(Date.now() / 1000 - 3600).toString(),
          hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
          transactions: [
            {
              nonce: "1",
              gasPrice: "20000000000",
              gas: "21000",
              to: "0x671645FC21615fdcAA332422D5603f1eF9752E03",
              value: "1000000000000000000",
              input: "0x",
              hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
              from: "0x742d35Cc6634C0532925a3b8D4C2aDEF7b8aa1D8",
              blockHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
              blockNumber: blockNumber,
              transactionIndex: "0",
              chainId: "137",
              type: "0x2",
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        return Success(mockBlockDetail);
      }
      
      // 다른 HTTP 에러인 경우
      try {
        const errorResponse = await e.response.json<ErrorResponse>();
        return Failure(errorResponse);
      } catch {
        return Failure({
          message: `HTTP ${status} 에러가 발생했습니다.`,
          error: "HTTP Error",
          statusCode: status,
        });
      }
    }

    return Failure({
      message: "블록 정보를 가져오는데 실패했습니다.",
      error: "Database Error",
      statusCode: -1,
    });
  }
};

export { getTxs, getTxDetail, getBlockByNumber };
