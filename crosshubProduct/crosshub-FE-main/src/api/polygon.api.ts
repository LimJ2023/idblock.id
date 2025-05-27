import { polygonApi } from "@/lib/ky-instance";
import { ErrorResponse } from "./common.api";
import { Failure, Success } from "@/lib/utils";
import { HTTPError } from "ky";

export interface TxResponse {
  status: string;
  message: string;
  result: Tx[];
}

export type Tx = {
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
  methodId: string;
  functionName: string;
};

export interface TxDetailResponse {
  jsonrpc: string;
  id: number;
  result: TxDetail;
}

export interface TxDetail {
  nonce: string;
  gasPrice: string;
  gas: string;
  to: string;
  value: string;
  input: string;
  v: string;
  r: string;
  s: string;
  hash: string;
  from: string;
  blockHash: string;
  blockNumber: string;
  transactionIndex: string;
  chainId: string;
  type: string;
}

export interface BlockDetailResponse {
  jsonrpc: string;
  id: number;
  result: BlockDetail;
}

export interface BlockDetail {
  parentHash: string;
  sha3Uncles: string;
  miner: string;
  stateRoot: string;
  transactionsRoot: string;
  receiptsRoot: string;
  logsBloom: string;
  difficulty: string;
  totalDifficulty: string;
  size: string;
  number: string;
  gasLimit: string;
  gasUsed: string;
  timestamp: string;
  extraData: string;
  mixHash: string;
  nonce: string;
  hash: string;
  transactions: Transaction[];
  uncles: unknown[];
}

export interface Transaction {
  nonce: string;
  gasPrice: string;
  gas: string;
  to: string;
  value: string;
  input: string;
  v: string;
  r: string;
  s: string;
  hash: string;
  from: string;
  blockHash: string;
  blockNumber: string;
  transactionIndex: string;
  chainId: string;
  type: string;
}

const getTxs: () => Promise<Result<Tx[], ErrorResponse>> = async () => {
  try {
    const json = await polygonApi
      .get("", {
        searchParams: {
          module: "account",
          action: "txlist",
          address: "0x671645FC21615fdcAA332422D5603f1eF9752E03",
          startblock: 0,
          endblock: 99999999,
          page: 1,
          offset: 10000,
          sort: "desc",
        },
      })
      .json<TxResponse>();

    return Success(json.result);
  } catch (e) {
    if (e instanceof HTTPError) {
      return Failure(await e.response.json<ErrorResponse>());
    }

    return Failure({
      message: "Something went wrong!",
      error: "Error",
      statusCode: -1,
    });
  }
};

const getTxDetail: (
  h: string,
) => Promise<Result<TxDetail, ErrorResponse>> = async (txHash) => {
  try {
    const json = await polygonApi
      .get("", {
        searchParams: {
          module: "proxy",
          action: "eth_getTransactionByHash",
          txHash,
        },
      })
      .json<TxDetailResponse>();

    return Success(json.result);
  } catch (e) {
    if (e instanceof HTTPError) {
      return Failure(await e.response.json<ErrorResponse>());
    }

    return Failure({
      message: "Something went wrong!",
      error: "Error",
      statusCode: -1,
    });
  }
};

const getBlockByNumber: (
  t: string,
) => Promise<Result<BlockDetail, ErrorResponse>> = async (tag) => {
  try {
    const json = await polygonApi
      .get("", {
        searchParams: {
          module: "proxy",
          action: "eth_getBlockByNumber",
          tag,
          boolean: true,
        },
      })
      .json<BlockDetailResponse>();

    return Success(json.result);
  } catch (e) {
    if (e instanceof HTTPError) {
      return Failure(await e.response.json<ErrorResponse>());
    }

    return Failure({
      message: "Something went wrong!",
      error: "Error",
      statusCode: -1,
    });
  }
};
export { getTxs, getTxDetail, getBlockByNumber };
