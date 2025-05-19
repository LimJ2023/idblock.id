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
    <main className="flex h-full w-full flex-col bg-neutral-100 p-8">
      <header className="mb-10 flex w-full flex-col gap-2 py-6">
        <div className="flex justify-between px-4">
          <h1 className="text-4xl font-semibold">방문 후기</h1>
        </div>
      </header>
      <section className="flex-1">
        <div className="flex w-full flex-col gap-4 rounded-3xl bg-white p-6">
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
