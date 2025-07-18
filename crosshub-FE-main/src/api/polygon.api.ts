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
  
  const transformed = {
    id: dbTx.id,
    blockNumber: dbTx.blockNumber || "0",
    timeStamp: dbTx.timeStamp || Math.floor(Date.now() / 1000).toString(), 
    hash: dbTx.hash || "",
    nonce: dbTx.nonce || "0",
    blockHash: dbTx.blockHash || "",
    transactionIndex: dbTx.transactionIndex || "0",
    from: dbTx.fromAddress || "",
    to: dbTx.toAddress || "",
    value: dbTx.value || "0", // 기본값 "0" 제공
    gas: dbTx.gas || "0",
    gasPrice: dbTx.gasPrice || "0",
    isError: dbTx.isError || "0",
    txreceipt_status: dbTx.txreceiptStatus || "0",
    input: dbTx.input || "0x",
    contractAddress: dbTx.contractAddress || "",
    cumulativeGasUsed: dbTx.cumulativeGasUsed || "0",
    gasUsed: dbTx.gasUsed || "0",
    confirmations: dbTx.confirmations || "0",
    methodId: dbTx.methodId,
    functionName: dbTx.functionName,
    createdAt: dbTx.createdAt,
    updatedAt: dbTx.updatedAt,
  };
  
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
  timeStamp: string;
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

// 트랜잭션 조회 파라미터 인터페이스
interface GetTxsParams {
  page?: number;
  limit?: number;
  contractAddress?: string;
}

// ContractStatsService - 타임아웃 방지를 위한 이중 조회 서비스 (임시 비활성화)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ContractStatsService {
  private static instance: ContractStatsService;
  private requestCache = new Map<string, Promise<Result<TxResponse, ErrorResponse>>>();

  static getInstance(): ContractStatsService {
    if (!ContractStatsService.instance) {
      ContractStatsService.instance = new ContractStatsService();
    }
    return ContractStatsService.instance;
  }

  // 컨트랙트 통계 조회 (초고속 + 폴백)
  async getContractStats(addresses: string[], page = 1, limit = 10): Promise<Result<TxResponse, ErrorResponse>> {
    const cacheKey = `${addresses.join(',')}-${page}-${limit}`;
    
    // 중복 요청 방지
    if (this.requestCache.has(cacheKey)) {
      const cachedResult = this.requestCache.get(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }
    }

    const request = this.performStatsRequest(addresses, page, limit);
    this.requestCache.set(cacheKey, request);
    
    // 30초 후 캐시 제거
    setTimeout(() => {
      this.requestCache.delete(cacheKey);
    }, 30000);

    return request;
  }

  private async performStatsRequest(addresses: string[], page: number, limit: number): Promise<Result<TxResponse, ErrorResponse>> {
    try {
      // 방법 1: 초고속 조회 시도
      console.log('초고속 조회 시도...');
      const fastResponse = await this.tryFastQuery(addresses, page, limit);
      if (fastResponse) {
        console.log('초고속 조회 성공');
        return fastResponse;
      }
    } catch (error) {
      console.warn('초고속 조회 실패, 일반 조회로 전환:', error);
    }

    // 방법 2: 폴백 - 병렬 처리
    console.log('병렬 처리 조회 시도...');
    return this.tryParallelQuery(addresses, page, limit);
  }

  // 초고속 조회 (30초 타임아웃)
  private async tryFastQuery(addresses: string[], page: number, limit: number): Promise<Result<TxResponse, ErrorResponse> | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30초 타임아웃

      // 초고속 트랜잭션 목록 조회 API 사용 (통계가 아닌 실제 트랜잭션 목록)
      const response = await api
        .get('transactions/latest', {
          searchParams: {
            contractAddress: addresses[0], // 첫 번째 컨트랙트 주소 사용
            limit: limit.toString(),
            sort: 'desc',
          },
          signal: controller.signal,
        })
        .json<{data: DbTxResponse}>();

      clearTimeout(timeoutId);

      if (response.data?.success) {
        return this.transformDbResponse(response.data, page, limit);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('초고속 조회 타임아웃');
      }
    }
    return null;
  }

  // 병렬 처리 조회 (캐시 사용)
  private async tryParallelQuery(addresses: string[], page: number, limit: number): Promise<Result<TxResponse, ErrorResponse>> {
    try {
      const response = await api
        .post('contracts/stats', {
          json: {
            contractAddresses: addresses,
            useCache: true,
            page,
            limit,
            sort: "desc",
          },
        })
        .json<{data: DbTxResponse}>();

      if (response.data?.success) {
        return this.transformDbResponse(response.data, page, limit);
      } else {
        return Failure({
          message: "병렬 처리 조회 실패",
          error: "API Error",
          statusCode: 400,
        });
      }
    } catch (error) {
      console.error('병렬 처리 조회 에러:', error);
      return this.fallbackToOriginalMethod(addresses[0], page, limit);
    }
  }

  // 기존 방식으로 폴백
  private async fallbackToOriginalMethod(contractAddress: string, page: number, limit: number): Promise<Result<TxResponse, ErrorResponse>> {
    console.warn('신규 API 실패, 기존 방식으로 폴백');
    return getOriginalTxs({ contractAddress, page, limit });
  }

  // DB 응답을 프론트엔드 형식으로 변환
  private transformDbResponse(dbResponse: DbTxResponse, page: number, limit: number): Result<TxResponse, ErrorResponse> {
    const transformedData: Tx[] = dbResponse.data?.map(transformDbTxToTx) || [];
    
    const transformedResponse: TxResponse = {
      success: dbResponse.success,
      data: transformedData,
      total: dbResponse.total || transformedData.length,
      page: page,
      limit: limit,
    };

    return Success(transformedResponse);
  }
}

// 기존 getTxs 함수를 백업하고 새로운 서비스 사용
const getOriginalTxs: (params?: GetTxsParams) => Promise<Result<TxResponse, ErrorResponse>> = async (params = {}) => {
  try {
    const requestUrl = "transactions";
    const searchParams = {
      contractAddress: params.contractAddress || "0x671645FC21615fdcAA332422D5603f1eF9752E03",
      page: (params.page || 1).toString(),
      limit: (params.limit || 10).toString(),
      sort: "desc",
    };
    
    const response = await api
      .get(requestUrl, {
        searchParams,
      })
      .json<{data: DbTxResponse}>();

    const actualResponse = response.data;

    if (!actualResponse.success) {
      console.error("트랜잭션 API 응답 실패:", actualResponse);
      return Failure({
        message: "트랜잭션 데이터를 가져오는데 실패했습니다.",
        error: "API Error",
        statusCode: 400,
      });
    }
    
    const transformedData: Tx[] = actualResponse.data?.map(transformDbTxToTx) || [];
    
    const transformedResponse: TxResponse = {
      success: actualResponse.success,
      data: transformedData,
      total: actualResponse.total,
      page: actualResponse.page,
      limit: actualResponse.limit,
    };

    return Success(transformedResponse);
  } catch (e) {
    console.error("기존 트랜잭션 API 호출 에러:", e);
    
    // HTTPError인 경우에만 상세 처리
    if (e instanceof HTTPError) {
      const status = e.response.status;
      
      // 404 에러인 경우 목업 데이터 반환 (백엔드 엔드포인트 미구현)
      if (status === 404) {
        console.warn("백엔드 엔드포인트가 없어 목업 데이터를 반환합니다.");
        
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
        return Failure(errorResponse);
      } catch {
        return Failure({
          message: `HTTP ${status} 에러가 발생했습니다.`,
          error: "HTTP Error",
          statusCode: status,
        });
      }
    }
    
    // 네트워크 에러 또는 기타 에러
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
      .json<{data: DbTxDetailResponse}>();

    // 실제 응답 데이터는 response.data에 있음
    const actualResponse = response.data;

    if (!actualResponse.success) {
      return Failure({
        message: "트랜잭션 상세 정보를 찾을 수 없습니다.",
        error: "Not Found",
        statusCode: 404,
      });
    }

    return Success(actualResponse.data);
  } catch (e) {
    console.error("트랜잭션 상세 API 에러:", e);
    
    if (e instanceof HTTPError) {
      const status = e.response.status;
      
      // 404 에러인 경우 목업 데이터 반환 (백엔드 엔드포인트 미구현)
      if (status === 404) {
        console.warn("트랜잭션 상세 백엔드 엔드포인트가 없어 목업 데이터를 반환합니다.");
        
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
    const response = await api
      .get(`blocks/${blockNumber}`)
      .json<{data: DbBlockDetailResponse}>();

    // 실제 응답 데이터는 response.data에 있음
    const actualResponse = response.data;

    if (!actualResponse.success) {
      return Failure({
        message: "블록 정보를 찾을 수 없습니다.",
        error: "Not Found",
        statusCode: 404,
      });
    }

    return Success(actualResponse.data);
  } catch (e) {
    console.error("블록 정보 API 에러:", e);
    
    if (e instanceof HTTPError) {
      const status = e.response.status;
      
      // 404 에러인 경우 목업 데이터 반환 (백엔드 엔드포인트 미구현)
      if (status === 404) {
        console.warn("블록 정보 백엔드 엔드포인트가 없어 목업 데이터를 반환합니다.");
        
        // 블록 번호를 기반으로 목업 데이터 생성
        const mockBlockDetail: BlockDetail = {
          id: Math.floor(Math.random() * 1000),
          parentHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          miner: "0x742d35Cc6634C0532925a3b8D4C2aDEF7b8aa1D8",
          number: blockNumber, // 실제 요청한 블록 번호 사용
          gasLimit: "30000000",
          gasUsed: "21000",
          timeStamp: Math.floor(Date.now() / 1000 - 3600).toString(),
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

// 기존 transactions API 사용 - 백엔드 최적화에 집중
const getTxs: (params?: GetTxsParams) => Promise<Result<TxResponse, ErrorResponse>> = async (params = {}) => {
  console.log('🔍 getTxs 호출됨 (기존 transactions API 사용):', params);
  
  // 기존 안정적인 transactions API를 직접 사용
  return getOriginalTxs(params);
  
  /* 
  // ContractStatsService는 백엔드 최적화 완료 후 다시 고려
  try {
    const contractStatsService = ContractStatsService.getInstance();
    const contractAddress = params.contractAddress || "0x671645FC21615fdcAA332422D5603f1eF9752E03";
    
    console.log('📡 ContractStatsService로 API 호출 시작:', { contractAddress, page: params.page, limit: params.limit });
    
    // 단일 컨트랙트 주소를 배열로 변환하여 새로운 서비스 사용
    const result = await contractStatsService.getContractStats(
      [contractAddress], 
      params.page || 1, 
      params.limit || 10
    );
    
    console.log('📊 ContractStatsService 응답:', result);
    return result;
  } catch (error) {
    console.error('❌ ContractStatsService 사용 중 에러, 기존 방식으로 폴백:', error);
    // 에러 시 기존 방식으로 폴백
    return getOriginalTxs(params);
  }
  */
};

export { getTxs, getTxDetail, getBlockByNumber };
