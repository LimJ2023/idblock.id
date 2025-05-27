import { createBrowserRouter, type RouteObject } from "react-router-dom";

import { RootPage } from "@/pages/root";

import { MainPage, SitesPage } from "@/pages/main";
import { queries } from "@/queries";
import { getQueryClient } from "@/queries/get-query-client";

import { getAuthStatus } from "@/api/auth.api";
import { UsersListPage } from "./pages/main/users";
import { SitesNewPage } from "./pages/main/sites/new";
import { SiteEditPage } from "./pages/main/sites/edit";
import { UserDetailPage } from "./pages/main/users/detail";
import { getManagerAuthStatus } from "./api/manager.auth.api";
import { ManagerRootPage } from "./pages/manager-root";
import { ManagerMainPage } from "./pages/manager";
import { QrPage } from "./pages/manager/qr";
import { VisitorPage } from "./pages/manager/visitor";
import { ReviewPage } from "./pages/manager/review";
import { ScanRootPage } from "./pages/scan-root";
import { TxDetailPage } from "./pages/tx-detail";
import { BlockDetailPage } from "./pages/block-detail";

const userRoutes: RouteObject[] = [
  {
    index: true,
    loader: async () => await getQueryClient().fetchQuery(queries.users.all()),
    element: <UsersListPage />,
  },
  {
    path: ":id",
    loader: async ({ params }) => {
      if (!params.id) {
        throw new Error("Insufficient path variable");
      }
      const result = await getQueryClient().fetchQuery(
        queries.users.detail(params.id),
      );

      if (!result.success) {
        throw new Error("No such Announcement");
      }

      return result.value;
    },
    element: <UserDetailPage />,
  },
];
const siteRoutes: RouteObject[] = [
  {
    index: true,
    loader: async () => await getQueryClient().fetchQuery(queries.sites.all),
    element: <SitesPage />,
  },
  {
    path: "new",
    element: <SitesNewPage />,
  },
  {
    path: "edit/:id",
    loader: async ({ params }) => {
      if (!params.id) {
        throw new Error("Insufficient path variable");
      }

      const id = Number.parseInt(params.id);

      if (Number.isNaN(id)) {
        throw new Error("Path variable not number");
      }

      const result = await getQueryClient().fetchQuery(
        queries.sites.detail(id.toString()),
      );

      if (!result.success) {
        throw new Error("No such Announcement");
      }

      return result.value;
    },
    element: <SiteEditPage />,
  },
];

const managerRoutes: RouteObject[] = [
  {
    path: "qr",
    children: [
      {
        index: true,
        element: <QrPage />,
      },
    ],
  },
  {
    path: "visitors",
    loader: async () => await getQueryClient().fetchQuery(queries.visitor.all),
    children: [
      {
        index: true,
        element: <VisitorPage />,
      },
    ],
  },
  {
    path: "reviews",
    loader: async () =>
      await getQueryClient().fetchQuery(queries.visitor.reviews),
    children: [
      {
        index: true,
        element: <ReviewPage />,
      },
    ],
  },
];

const mainRoutes: RouteObject[] = [
  {
    path: "users",
    children: userRoutes,
  },
  {
    path: "sites",
    children: siteRoutes,
  },
];

const router = createBrowserRouter([
  ...(import.meta.env.VITE_SCOPE === "MANAGER"
    ? ([
        {
          path: "/",
          element: <ManagerRootPage />,
        },
        {
          path: "/manager",
          loader: async () => await getManagerAuthStatus(),
          element: <ManagerMainPage />,
          children: managerRoutes,
        },
      ] as RouteObject[])
    : import.meta.env.VITE_SCOPE === "ADMIN"
      ? ([
          {
            path: "/",
            element: <RootPage />,
          },
          {
            path: "/main",
            loader: async () => await getAuthStatus(),
            element: <MainPage />,
            children: mainRoutes,
          },
        ] as RouteObject[])
      : import.meta.env.VITE_SCOPE === "SCAN"
        ? ([
            {
              path: "/",
              loader: async () => {
                const result = await getQueryClient().fetchQuery(
                  queries.txs.all,
                );
                return result;
              },
              element: <ScanRootPage />,
            },
            {
              path: "/tx/:id",
              loader: async ({ params }) => {
                if (!params.id) {
                  throw new Error("Insufficient path variable");
                }

                const result = await getQueryClient().fetchQuery(
                  queries.txs.detail(params.id),
                );

                if (!result.success) {
                  throw new Error("No such tx");
                }

                return result.value;
              },
              element: <TxDetailPage />,
            },
            {
              path: "/block/:id",
              loader: async ({ params }) => {
                if (!params.id) {
                  throw new Error("Insufficient path variable");
                }

                const result = await getQueryClient().fetchQuery(
                  queries.txs.block(params.id),
                );

                if (!result.success) {
                  throw new Error("No such tx");
                }

                return result.value;
              },
              element: <BlockDetailPage />,
            },
          ] as RouteObject[])
        : []),
]);

export { router };
