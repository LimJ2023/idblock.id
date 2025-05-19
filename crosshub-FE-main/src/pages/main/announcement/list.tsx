import { Suspense } from "react";

import { ErrorBoundary } from "@toss/error-boundary";

import { useSuspenseQuery } from "@tanstack/react-query";

import { Link } from "react-router-dom";

import { columns as announcementColumns } from "@/components/table-columns/announcement";

import { ErrorTable, LoadingTable } from "@/components/tables/common";

import { cn } from "@/lib/utils";

import { queries } from "@/queries";

import { AnnouncementTable } from "@/components/tables/announcement-table";

const AnnouncementListPage = () => {
  const { data: result } = useSuspenseQuery(queries.announcement.all);

  return (
    <main className="flex w-full flex-col bg-neutral-100 p-8">
      <header className="flex w-full flex-col gap-2 py-6">
        <div className="flex justify-between px-4">
          <h1 className="p-1 text-lg font-semibold leading-[1.35rem]">
            공지사항 목록
          </h1>
          <Link
            to="/main/announcement/new"
            className={cn(
              "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-600 focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:bg-[#AEAEAE]",
              "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
              "bg-secondary px-4 py-2 text-neutral-100 hover:bg-secondary/90",
            )}
          >
            공지사항 등록
          </Link>
        </div>
      </header>
      <section className="flex-1">
        <div className="flex w-full flex-col rounded-3xl bg-white p-6">
          <ErrorBoundary
            renderFallback={(props) => (
              <ErrorTable error={props.error} columns={announcementColumns} />
            )}
            onError={(error) => console.error(error)}
          >
            <Suspense fallback={<LoadingTable columns={announcementColumns} />}>
              <AnnouncementTable
                columns={announcementColumns}
                result={result}
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      </section>
    </main>
  );
};

export { AnnouncementListPage };
