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

const TxsTable = <TData, TValue>({
  columns,
  caption,
  captionSide = "top",
}: Omit<DataTableProps<TData, TValue>, 'result'>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // 서버 사이드 페이지네이션을 위한 쿼리
  const { data: result } = useQuery({
    ...queries.txs.all({ page: currentPage, limit: pageSize }),
    // 페이지 변경 시에만 다시 로드
    staleTime: 30 * 1000, // 30초
    gcTime: 5 * 60 * 1000, // 5분
  });

  const { data: txsData = [], total = 0 } = result?.success ? result.value : {};
  const totalPages = Math.ceil(total / pageSize);

  // 서버 사이드 페이지네이션을 위한 테이블 설정
  const table = useReactTable({
    columns,
    data: txsData as TData[],
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // 수동 페이지네이션 활성화
    pageCount: totalPages, // 총 페이지 수 설정
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
        setCurrentPage(newPagination.pageIndex + 1); // 1-based로 변환
      } else {
        setCurrentPage(updater.pageIndex + 1);
      }
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <Table captionSide={captionSide}>
        <TableCaption>
          {caption} (페이지 {currentPage}/{totalPages}, 총 {total}개)
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
                내용이 없습니다.
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
