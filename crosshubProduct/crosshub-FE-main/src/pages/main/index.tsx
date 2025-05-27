import { Navigate, Outlet, useLoaderData } from "react-router-dom";

import { Toaster } from "@/components/ui/toaster";

import { SideNavigation } from "@/components/side-navigation";

import { ErrorResponse } from "@/api/common.api";
import { AdminAccountsPage } from "@/pages/main/admin-accounts";
import { AnnouncementPage } from "@/pages/main/announcement";
import { UsersPage } from "@/pages/main/users";
import { FAQPage } from "@/pages/main/faq";
import { SitesPage } from "./sites/list";

const MainPage = () => {
  const auth = useLoaderData() as Result<null, ErrorResponse>;

  if (!auth.success) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex min-h-screen">
      <SideNavigation />
      <div className="max-h-screen flex-1 overflow-y-auto">
        <Outlet />
      </div>
      <Toaster />
    </div>
  );
};

export {
  AdminAccountsPage,
  AnnouncementPage,
  UsersPage,
  FAQPage,
  MainPage,
  SitesPage,
};
