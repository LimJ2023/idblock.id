import { Suspense } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";

import { ErrorBoundary } from "@toss/error-boundary";

import { FAQDialog } from "@/components/dialogs/faq";

import { columns as faqColumns } from "@/components/table-columns/faq";

import { ErrorTable, LoadingTable } from "@/components/tables/common";
import { FAQTable } from "@/components/tables/faq-table";

import { queries } from "@/queries";

const FAQPage = () => {
  const { data: result } = useSuspenseQuery({ ...queries.faq.all });

  return (
    <main className="flex w-full flex-col bg-neutral-100 p-8">
      <header className="flex w-full flex-col gap-2 py-6">
        <div className="flex justify-between px-4">
          <h1 className="p-1 text-lg font-semibold leading-[1.35rem]">
            자주묻는 질문 게시글 관리
          </h1>
          <FAQDialog data={{ type: "add" }} />
        </div>
      </header>
      <section className="flex-1">
        <div className="flex w-full flex-col gap-4 rounded-3xl bg-white p-6">
          <ErrorBoundary
            renderFallback={(props) => (
              <ErrorTable error={props.error} columns={faqColumns} />
            )}
            onError={(error) => console.error(error)}
          >
            <Suspense fallback={<LoadingTable columns={faqColumns} />}>
              <FAQTable columns={faqColumns} result={result} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </section>
    </main>
  );
};

export { FAQPage };
