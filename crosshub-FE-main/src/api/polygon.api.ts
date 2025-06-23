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
    const response = await api
      .get("transactions", {
        searchParams: {
          contractAddress: "0x671645FC21615fdcAA332422D5603f1eF9752E03",
          page: "1",
          limit: "100",
          sort: "desc",
        },
      })
      .json<DbTxResponse>();

    if (!response.success) {
      return Failure({
        message: "트랜잭션 데이터를 가져오는데 실패했습니다.",
        error: "API Error",
        statusCode: 400,
      });
    }

    return Success(response.data);
  } catch (e) {
    if (e instanceof HTTPError) {
      return Failure(await e.response.json<ErrorResponse>());
    }

    return Failure({
      message: "데이터베이스에서 트랜잭션 데이터를 가져오는데 실패했습니다.",
      error: "Database Error",
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
