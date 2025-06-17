import { useState } from "react";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationState,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  // TableHead,
  // TableHeader,
  TableRow,
} from "@/components/ui/table";

import { cn } from "@/lib/utils";
import { BackofficePagination } from "@/components/pagination";
import type { DataTableProps } from "@/components/tables/common";

const VisitReviewTable = <TData, TValue>({
  columns,
  result,
  caption,
  captionSide = "top",
}: DataTableProps<TData, TValue>) => {
  if (!result.success) {
    if (result.error.statusCode === 403) {
      throw new Error("데이터를 읽을 수 있는 권한이 없습니다.");
    }

    throw new Error("데이터를 불러오는 데에 실패했습니다.");
  }

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [selection, setSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    columns,
    data: result.value,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setSelection,
    onPaginationChange: setPagination,
    state: {
      pagination,
      rowSelection: selection,
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <Table captionSide={captionSide}>
        <TableCaption>{caption}</TableCaption>
        {/* <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader> */}
        <TableBody className="border-none">
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="flex w-full flex-wrap items-center rounded-lg border-none bg-[#FAFAFA] px-5 py-3 hover:bg-[#FAFAFA]"
                onClick={() => {}}
              >
                {row.getVisibleCells().map((cell, index) => {
                  const isLastCell = index === row.getVisibleCells().length - 1;

                  return (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        isLastCell
                          ? "w-full border-t border-[#e5e7eb]"
                          : "relative w-auto pl-4 pr-4 after:absolute after:left-0 after:top-[50%] after:h-[4px] after:w-[4px] after:translate-y-[-50%] after:rounded-[100%] after:bg-[#e5e7eb] after:content-[''] first:px-0 first:after:content-none [&:nth-child(2)]:after:content-none",
                        "hover:bg-transparent",
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell className="text-center" colSpan={columns.length}>
                내용이 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter></TableFooter>
      </Table>
      <div className="flex justify-center">
        <BackofficePagination table={table} />
      </div>
    </div>
  );
};

export { VisitReviewTable };
