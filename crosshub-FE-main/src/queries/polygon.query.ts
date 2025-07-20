import { getBlockByNumber, getTxDetail, getTxs, getTxStats } from "@/api/polygon.api";
import { createQueryKeys } from "@lukemorales/query-key-factory";

interface TxsQueryParams {
  page?: number;
  limit?: number;
  contractAddress?: string;
}

const txs = createQueryKeys("txs", {
  all: (params: TxsQueryParams = {}) => {
    // API에서 사용하는 기본 컨트랙트 주소와 동일하게 설정
    const contractAddress = params.contractAddress || "0x671645FC21615fdcAA332422D5603f1eF9752E03";
    return {
      queryKey: [params.page || 1, params.limit || 10, contractAddress],
      queryFn: () => getTxs(params),
    };
  },
  stats: (contractAddress?: string) => {
    const address = contractAddress || "0x671645FC21615fdcAA332422D5603f1eF9752E03";
    return {
      queryKey: ["stats", address],
      queryFn: () => getTxStats(address),
    };
  },
  detail: (hash: string) => ({
    queryKey: [hash],
    queryFn: () => getTxDetail(hash),
  }),
  block: (tag: string) => ({
    queryKey: [tag],
    queryFn: () => getBlockByNumber(tag),
  }),
});

export { txs };
