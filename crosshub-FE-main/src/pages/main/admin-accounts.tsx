import { Suspense } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";

import { ErrorBoundary } from "@toss/error-boundary";

import { DataTable } from "@/components/tables/data-table";

import { columns as adminAccountColumns } from "@/components/table-columns/admin-account";

import { ErrorTable, LoadingTable } from "@/components/tables/common";

import { AddAdminAccountDialog } from "@/components/dialogs/add-admin-account";

import { queries } from "@/queries";

const AdminAccountsPage = () => {
  const { data: result } = useSuspenseQuery({ ...queries.admin.all });

  return (
    <main className="flex w-full flex-col bg-neutral-100 p-8">
      <header className="flex w-full flex-col gap-2 py-6">
        <div className="flex justify-between px-4">
          <h1 className="p-1 text-lg font-semibold leading-[1.35rem]">
            관리자 계정 관리
          </h1>
          <AddAdminAccountDialog />
        </div>
      </header>
      <section className="flex-1">
        <div className="flex w-full flex-col rounded-3xl bg-white p-6">
          <ErrorBoundary
            renderFallback={(props) => (
              <ErrorTable error={props.error} columns={adminAccountColumns} />
            )}
            onError={(error) => console.error(error)}
          >
            <Suspense fallback={<LoadingTable columns={adminAccountColumns} />}>
              <DataTable columns={adminAccountColumns} result={result} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </section>
    </main>
  );
};

export { AdminAccountsPage };
