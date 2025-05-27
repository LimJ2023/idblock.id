import { createQueryKeys } from "@lukemorales/query-key-factory";

import {
  getAnnouncementDetail,
  getAnnouncements,
} from "@/api/announcement.api";

const announcement = createQueryKeys("announcement", {
  all: { queryKey: [""], queryFn: getAnnouncements },
  detail: (id: number) => ({
    queryKey: [id],
    queryFn: async () => await getAnnouncementDetail(id),
  }),
});

export { announcement };
