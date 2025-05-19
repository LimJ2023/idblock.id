import { getSite, getSites } from "@/api/sites.api";
import { createQueryKeys } from "@lukemorales/query-key-factory";

const sites = createQueryKeys("sites", {
  all: { queryKey: [""], queryFn: getSites },
  detail: (id: string) => ({
    queryKey: [id],
    queryFn: async () => await getSite(id),
  }),
});

export { sites };
