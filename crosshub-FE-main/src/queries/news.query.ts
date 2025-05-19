import { createQueryKeys } from "@lukemorales/query-key-factory";

import { getNews } from "@/api/news.api";

const news = createQueryKeys("news", {
  all: { queryKey: [""], queryFn: getNews },
});

export { news };
