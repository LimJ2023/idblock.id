import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  flexRender,
  getCoreRowModel,
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

import type { DataTableProps } from "@/components/tables/common";
import { BackofficePagination } from "../pagination";
import { queries } from "@/queries";

interface TxsTableProps<TData, TValue> extends Omit<DataTableProps<TData, TValue>, 'result'> {
  contractAddress?: string;
}

const TxsTable = <TData, TValue>({
  columns,
  caption,
  captionSide = "top",
  contractAddress,
}: TxsTableProps<TData, TValue>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Server-side pagination query
  const { data: result } = useQuery({
    ...queries.txs.all({ 
      page: currentPage, 
      limit: pageSize,
      contractAddress: contractAddress 
    }),
    // Reload only on page change
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: txsData = [], total = 0 } = result?.success ? result.value : {};
  const totalPages = Math.ceil(total / pageSize);

  // Table configuration for server-side pagination
  const table = useReactTable({
    columns,
    data: txsData as TData[],
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // Enable manual pagination
    pageCount: totalPages, // Set total page count
    state: {
      pagination: {
        pageIndex: currentPage - 1, // 0-based index
        pageSize,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newPagination = updater({
          pageIndex: currentPage - 1,
          pageSize,
        });
        setCurrentPage(newPagination.pageIndex + 1); // Convert to 1-based
      } else {
        setCurrentPage(updater.pageIndex + 1);
      }
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <Table captionSide={captionSide}>
        <TableCaption>
          {caption} (Page {currentPage}/{totalPages}, Total {total} items)
        </TableCaption>
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
                No content available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter />
      </Table>
      <div className="flex justify-center">
        <BackofficePagination table={table} />
      </div>
    </div>
  );
};

export { TxsTable };
