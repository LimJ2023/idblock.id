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
    <main className="flex h-full w-full flex-col bg-neutral-100 p-8">
      <header className="mb-10 flex w-full flex-col gap-2 py-6">
        <div className="flex justify-between px-4">
          <h1 className="text-4xl font-semibold">관광지 관리</h1>
          <Button asChild className="rounded-xl">
            <Link to="/main/sites/new" className={cn()}>
              <Plus />
              <span>관광지 추가 등록</span>
            </Link>
          </Button>
        </div>
      </header>
      <section className="flex-1">
        <div className="flex w-full flex-col gap-4 rounded-3xl bg-white p-6">
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
  );
};

export { SitesPage };
