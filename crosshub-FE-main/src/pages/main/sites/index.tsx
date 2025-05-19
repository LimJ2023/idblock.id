import { AnnouncementEditPage } from "@/pages/main/announcement/edit";
import { AnnouncementListPage } from "@/pages/main/announcement/list";
import { AnnouncementNewPage } from "@/pages/main/announcement/new";

import { Outlet } from "react-router-dom";

const AnnouncementPage = () => {
  return <Outlet />;
};

export {
  AnnouncementEditPage,
  AnnouncementListPage,
  AnnouncementNewPage,
  AnnouncementPage,
};
