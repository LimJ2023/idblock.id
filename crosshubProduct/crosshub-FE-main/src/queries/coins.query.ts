import { createQueryKeys } from "@lukemorales/query-key-factory";

import { getCoins } from "@/api/coins.api";

const coins = createQueryKeys("coins", {
  all: { queryKey: [""], queryFn: getCoins },
});

export { coins };
