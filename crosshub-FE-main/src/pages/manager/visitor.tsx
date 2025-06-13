import { Suspense } from "react";

import { ErrorBoundary } from "@toss/error-boundary";

import { useSuspenseQuery } from "@tanstack/react-query";

import { columns as visitorColumns } from "@/components/table-columns/visitor";

import { ErrorTable, LoadingTable } from "@/components/tables/common";

import { queries } from "@/queries";

import { VisitorTable } from "@/components/tables/visitor-table";

const VisitorPage = () => {
  const { data: result } = useSuspenseQuery({ ...queries.visitor.all });

  return (
    <main className="flex h-dvh w-full flex-col border bg-white text-[#1E1E1E]">
      <header className="p-5">
        <h1 className="px-4 py-2 text-3xl font-semibold text-[#1E1E1E]">
          방문객 리스트
        </h1>
      </header>

      <section className="h-full w-full items-center justify-center border-t border-[#E5E7EB] bg-[#FAFBFC] p-6">
        <div className="h-full w-full rounded-3xl border border-[#E5E7EB] bg-white px-10 py-10">
          <ErrorBoundary
            renderFallback={(props) => (
              <ErrorTable error={props.error} columns={visitorColumns} />
            )}
            onError={(error) => console.error(error)}
          >
            <Suspense fallback={<LoadingTable columns={visitorColumns} />}>
              <VisitorTable columns={visitorColumns} result={result} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </section>
    </main>
  );
};

export { VisitorPage };
