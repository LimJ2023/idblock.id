import { createQueryKeys } from "@lukemorales/query-key-factory";

import { getFAQs } from "@/api/faq.api";

const faq = createQueryKeys("faq", {
  all: { queryKey: [""], queryFn: getFAQs },
});

export { faq };
