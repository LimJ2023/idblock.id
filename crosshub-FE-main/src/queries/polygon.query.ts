import { getBlockByNumber, getTxDetail, getTxs } from "@/api/polygon.api";
import { createQueryKeys } from "@lukemorales/query-key-factory";

interface TxsQueryParams {
  page?: number;
  limit?: number;
  contractAddress?: string;
}

const txs = createQueryKeys("txs", {
  all: (params: TxsQueryParams = {}) => ({
    queryKey: [params.page || 1, params.limit || 10, params.contractAddress],
    queryFn: () => getTxs(params),
  }),
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
