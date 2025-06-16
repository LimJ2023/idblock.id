import { Suspense } from "react";

import { ErrorBoundary } from "@toss/error-boundary";

import { useSuspenseQuery } from "@tanstack/react-query";

import { columns as sitesColumns } from "@/components/table-columns/sites";

import { ErrorTable, LoadingTable } from "@/components/tables/common";

import { queries } from "@/queries";
import { SitesTable } from "@/components/tables/sites-table";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const SitesPage = () => {
  const { data: result } = useSuspenseQuery({ ...queries.sites.all });

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <header className="flex w-full flex-col p-5">
        <div className="">
          <h1 className="px-4 py-2 text-3xl font-semibold text-[#1E1E1E]">
            관광지 관리
          </h1>
        </div>
      </header>
      <main className="flex h-full w-full flex-col border-t border-[#E5E7EB] bg-[#FAFBFC] px-6 py-4">
        <div className="flex justify-end pb-4">
          <Button
            asChild
            className="w-content flex w-fit rounded-lg border border-[#E5E7EB] px-4"
          >
            <Link to="/main/sites/new" className={cn()}>
              <Plus />
              <span>관광지 추가</span>
            </Link>
          </Button>
        </div>
        <section className="flex-1">
          <div className="flex w-full flex-col gap-4 rounded-3xl border border-[#E5E7EB] bg-white p-6 text-[#333333]">
            <ErrorBoundary
              renderFallback={(props) => (
                <ErrorTable error={props.error} columns={sitesColumns} />
              )}
              onError={(error) => console.error(error)}
            >
              <Suspense fallback={<LoadingTable columns={sitesColumns} />}>
                <SitesTable columns={sitesColumns} result={result} />
              </Suspense>
            </ErrorBoundary>
          </div>
        </section>
      </main>
    </div>
  );
};

export { SitesPage };
