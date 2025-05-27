import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { cn } from "@/lib/utils";

const BackofficePaginationLinks = <TData,>({
  table,
}: {
  table: Table<TData>;
}) => {
  const pageCount = table.getPageCount();

  const pages = Array.from(Array(pageCount).keys());

  if (pageCount <= 5) {
    return (
      <>
        {pages.map((pageIndex) => (
          <PaginationItem key={pageIndex + 1}>
            <PaginationLink
              isActive={table.getState().pagination.pageIndex === pageIndex}
              asChild
            >
              <Button
                onClick={() => table.setPageIndex(pageIndex)}
                className={cn(
                  "h-7 w-7 bg-transparent p-0 font-pretendard text-neutral-600",
                  "aria-[current=page]:bg-primary aria-[current=page]:text-white",
                  "hover:text-white",
                )}
              >
                {pageIndex + 1}
              </Button>
            </PaginationLink>
          </PaginationItem>
        ))}
      </>
    );
  }

  const currentPageIndex = table.getState().pagination.pageIndex;

  if (currentPageIndex === 0 || currentPageIndex === 1) {
    return (
      <>
        {pages.slice(0, 4).map((pageIndex) => (
          <PaginationItem key={pageIndex + 1}>
            <PaginationLink
              isActive={table.getState().pagination.pageIndex === pageIndex}
              asChild
            >
              <Button
                onClick={() => table.setPageIndex(pageIndex)}
                className={cn(
                  "h-7 w-7 bg-transparent p-0 font-pretendard text-neutral-600",
                  "aria-[current=page]:bg-primary aria-[current=page]:text-white",
                  "hover:text-white",
                )}
              >
                {pageIndex + 1}
              </Button>
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
      </>
    );
  }

  if (
    currentPageIndex === pageCount - 1 ||
    currentPageIndex === pageCount - 2
  ) {
    return (
      <>
        <PaginationItem className="aspect-square h-7 w-7">
          <PaginationEllipsis />
        </PaginationItem>
        {pages.slice(-4).map((pageIndex) => (
          <PaginationItem key={pageIndex + 1}>
            <PaginationLink
              isActive={table.getState().pagination.pageIndex === pageIndex}
              asChild
            >
              <Button
                onClick={() => table.setPageIndex(pageIndex)}
                className={cn(
                  "h-7 w-7 bg-transparent p-0 font-pretendard text-neutral-600",
                  "aria-[current=page]:bg-primary aria-[current=page]:text-white",
                  "hover:text-white",
                )}
              >
                {pageIndex + 1}
              </Button>
            </PaginationLink>
          </PaginationItem>
        ))}
      </>
    );
  }

  return (
    <>
      <PaginationItem>
        <PaginationEllipsis />
      </PaginationItem>
      {pages
        .slice(currentPageIndex - 1, currentPageIndex + 2)
        .map((pageIndex) => (
          <PaginationItem key={pageIndex + 1}>
            <PaginationLink
              isActive={table.getState().pagination.pageIndex === pageIndex}
              asChild
            >
              <Button
                onClick={() => table.setPageIndex(pageIndex)}
                className={cn(
                  "h-7 w-7 bg-transparent p-0 font-pretendard text-neutral-600",
                  "aria-[current=page]:bg-primary aria-[current=page]:text-white",
                  "hover:text-white",
                )}
              >
                {pageIndex + 1}
              </Button>
            </PaginationLink>
          </PaginationItem>
        ))}
      <PaginationItem>
        <PaginationEllipsis />
      </PaginationItem>
    </>
  );
};

const BackofficePagination = <TData,>({ table }: { table: Table<TData> }) => {
  return (
    <Pagination className="mx-0 w-fit">
      <PaginationContent>
        <PaginationItem>
          <PaginationLink asChild>
            <Button
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.firstPage()}
              className={cn(
                "h-7 w-7 bg-transparent p-0 font-pretendard text-black",
                "disabled:bg-transparent disabled:text-neutral-400",
              )}
            >
              <ChevronsLeft className="h-6 w-6" />
            </Button>
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink asChild>
            <Button
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              className={cn(
                "h-7 w-7 bg-transparent p-0 font-pretendard text-black",
                "disabled:bg-transparent disabled:text-neutral-400",
              )}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </PaginationLink>
        </PaginationItem>
        <BackofficePaginationLinks table={table} />
        <PaginationItem>
          <PaginationLink asChild>
            <Button
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              className={cn(
                "h-7 w-7 bg-transparent p-0 font-pretendard text-black",
                "disabled:bg-transparent disabled:text-neutral-400",
              )}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink asChild>
            <Button
              disabled={!table.getCanNextPage()}
              onClick={() => table.lastPage()}
              className={cn(
                "h-7 w-7 bg-transparent p-0 font-pretendard text-black",
                "disabled:bg-transparent disabled:text-neutral-400",
              )}
            >
              <ChevronsRight className="h-6 w-6" />
            </Button>
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export { BackofficePagination };
