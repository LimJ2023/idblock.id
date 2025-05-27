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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { BackofficePagination } from "@/components/pagination";

import { RemoveNewsDialog } from "@/components/dialogs/remove-news";

import type { DataTableProps } from "@/components/tables/common";

const NewsTable = <TData, TValue>({
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
        <TableHeader>
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
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
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
      <div className="flex justify-end">
        <BackofficePagination table={table} />
      </div>
      <div>
        <RemoveNewsDialog
          selected={table
            .getSelectedRowModel()
            .rows.map((row) => row.getValue<number>("id"))}
          reset={() => setSelection({})}
        />
      </div>
    </div>
  );
};

export { NewsTable };
