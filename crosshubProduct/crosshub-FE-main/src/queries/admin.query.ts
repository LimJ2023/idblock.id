import { createQueryKeys } from "@lukemorales/query-key-factory";

import { getAdmins } from "@/api/admin.api";

const admin = createQueryKeys("admin", {
  all: { queryKey: [""], queryFn: getAdmins },
});

export { admin };
