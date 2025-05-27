import { Suspense, useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";

import { ErrorBoundary } from "@toss/error-boundary";

import { ErrorTable, LoadingTable } from "@/components/tables/common";

import { queries } from "@/queries";
import { columns as usersColumns } from "@/components/table-columns/users";
import { UsersTable } from "@/components/tables/users-table";
import { StatusFilter } from "@/queries/users.query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const UsersListPage = () => {
  const [filterState, setFilterState] = useState<StatusFilter>("OPENED");
  const { data: result } = useSuspenseQuery({
    ...queries.users.all(filterState),
  });

  return (
    <main className="flex h-full w-full flex-col bg-neutral-100 p-8">
      <header className="mb-10 flex w-full flex-col gap-2 py-6">
        <div className="flex justify-between px-4">
          <h1 className="text-4xl font-semibold">사용자 관리</h1>
        </div>
      </header>

      <Tabs
        defaultValue="OPENED"
        className="pb-6"
        onValueChange={(value) => setFilterState(value as StatusFilter)}
      >
        <TabsList>
          <TabsTrigger
            value="OPENED"
            className="rounded-3xl px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-none"
          >
            승인 전
          </TabsTrigger>
          <TabsTrigger
            value="APPROVED"
            className="rounded-3xl px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-none"
          >
            승인 완료
          </TabsTrigger>
          <TabsTrigger
            value="REJECTED"
            className="rounded-3xl px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-none"
          >
            승인 거절
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <section className="flex-1">
        <div className="flex w-full flex-col rounded-3xl bg-white p-6">
          <ErrorBoundary
            renderFallback={(props) => (
              <ErrorTable error={props.error} columns={usersColumns} />
            )}
            onError={(error) => console.error(error)}
          >
            <Suspense fallback={<LoadingTable columns={usersColumns} />}>
              <UsersTable columns={usersColumns} result={result} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </section>
    </main>
  );
};

export { UsersListPage };
