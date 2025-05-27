import { getBlockByNumber, getTxDetail, getTxs } from "@/api/polygon.api";
import { createQueryKeys } from "@lukemorales/query-key-factory";

const txs = createQueryKeys("txs", {
  all: { queryKey: [""], queryFn: getTxs },
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
