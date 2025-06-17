import { Suspense } from "react";

import { ErrorBoundary } from "@toss/error-boundary";

import { useSuspenseQuery } from "@tanstack/react-query";

import { columns as reviewColumns } from "@/components/table-columns/visit-review";

import { ErrorTable, LoadingTable } from "@/components/tables/common";

import { queries } from "@/queries";
import { VisitReviewTable } from "@/components/tables/visit-review-table";

const ReviewPage = () => {
  const { data: result } = useSuspenseQuery({ ...queries.visitor.reviews });

  return (
    <main className="flex h-dvh w-full flex-col bg-white text-[#1E1E1E]">
      <header className="p-5">
        <h1 className="px-4 py-2 text-3xl font-semibold text-[#1E1E1E]">
          방문 후기
        </h1>
      </header>

      <section className="h-full w-full items-center justify-center border-t border-[#E5E7EB] bg-[#FAFBFC] p-6">
        <div className="h-full w-full rounded-3xl border border-[#E5E7EB] bg-white px-10 py-10">
          <ErrorBoundary
            renderFallback={(props) => (
              <ErrorTable error={props.error} columns={reviewColumns} />
            )}
            onError={(error) => console.error(error)}
          >
            <Suspense fallback={<LoadingTable columns={reviewColumns} />}>
              <VisitReviewTable columns={reviewColumns} result={result} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </section>
    </main>
  );
};

export { ReviewPage };
