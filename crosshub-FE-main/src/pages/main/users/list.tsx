import { Suspense, useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";

import { ErrorBoundary } from "@toss/error-boundary";

import { ErrorTable, LoadingTable } from "@/components/tables/common";

import { queries } from "@/queries";
import { columns as usersColumns } from "@/components/table-columns/users";
import { UsersTable } from "@/components/tables/users-table";
import { StatusFilter } from "@/queries/users.query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeAlert, BadgeCheck, BadgeX } from "lucide-react";

const UsersListPage = () => {
  const [filterState, setFilterState] = useState<StatusFilter>("OPENED");
  const { data: result } = useSuspenseQuery({
    ...queries.users.all(filterState),
  });

  return (
    <main className="flex h-full w-full flex-col bg-white">
      <header className="flex w-full flex-col gap-2 border-b-2 border-[#E5E7EB] p-5 pb-0">
        <div className="flex justify-between px-4 py-2">
          <h1 className="text-3xl font-semibold">사용자 관리</h1>
        </div>

        <Tabs
          defaultValue="OPENED"
          className="pb-2"
          onValueChange={(value) => setFilterState(value as StatusFilter)}
        >
          <TabsList className="pl-[0px]">
            <TabsTrigger
              value="OPENED"
              className="rounded-none px-4 py-3.5 text-[#666666] data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              <BadgeAlert className="mr-2 w-[18px] gap-2" />
              승인 전
            </TabsTrigger>
            <TabsTrigger
              value="APPROVED"
              className="rounded-none px-4 py-4 text-[#666666] data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              <BadgeCheck className="mr-2 w-[18px] gap-2" />
              승인 완료
            </TabsTrigger>
            <TabsTrigger
              value="REJECTED"
              className="rounded-none px-4 py-4 text-[#666666] data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              <BadgeX className="mr-2 w-[18px] gap-2" />
              승인 거절
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <section className="flex-1 bg-[#FAFBFC] p-5">
        <div className="bg-whit6 mt-6 flex w-full flex-col rounded-3xl border border-[#E5E7EB] bg-white p-6">
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
