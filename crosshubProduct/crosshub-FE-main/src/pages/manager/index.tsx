import { Navigate, Outlet, useLoaderData } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";

import { ErrorResponse } from "@/api/common.api";
import { SideNavigationManager } from "@/components/side-navigation-manager";

const ManagerMainPage = () => {
  const auth = useLoaderData() as Result<null, ErrorResponse>;

  if (!auth.success) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex min-h-screen">
      <SideNavigationManager />
      <div className="max-h-screen flex-1 overflow-y-auto">
        <Outlet />
      </div>
      <Toaster />
    </div>
  );
};

export { ManagerMainPage };
