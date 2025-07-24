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

// 트랜잭션 통계 정보를 표시하는 컴포넌트
const TxsStats = ({ contractAddress }: { contractAddress?: string }) => {
  const { data: statsResult, isLoading, error } = useQuery({
    ...queries.txs.stats(contractAddress),
    staleTime: 2 * 60 * 1000, // 2분간 캐시
    gcTime: 10 * 60 * 1000, // 10분간 메모리 유지
  });

  const stats = statsResult?.success ? statsResult.value : null;



  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-700">Transaction Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-700">Transaction Statistics</h3>
        <div className="text-red-500 text-sm">
          Failed to load statistics information.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-medium text-gray-700">Transaction Statistics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-500 mb-1">Current Contract</div>
          <div className="text-2xl font-bold text-blue-600">
            {stats.currentContractTxCount.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 mt-1">Transactions</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-500 mb-1">All Contracts</div>
          <div className="text-2xl font-bold text-green-600">
            {stats.allContractsTxCount.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 mt-1">Total Transactions</div>
        </div>
      </div>
      <div className="text-md text-gray-700 mt-2">
        Current Contract Address: <span className="text-black font-bold">{stats.contractAddress}</span>
      </div>
    </div>
  );
};

const TxsTable = <TData, TValue>({
  columns,
  caption,
  captionSide = "top",
  contractAddress,
}: TxsTableProps<TData, TValue>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Server-side pagination query
  const { data: result, isLoading, error } = useQuery({
    ...queries.txs.all({ 
      page: currentPage, 
      limit: pageSize,
      contractAddress: contractAddress 
    }),
    staleTime: 30 * 1000, // 30초
    gcTime: 5 * 60 * 1000, // 5분
  });

  // 데이터 구조 수정: API 응답이 { success: boolean, data: Tx[], total: number } 형태
  const responseData = result?.success ? result.value : null;
  const txsData = responseData?.data || [];
  const total = responseData?.total || 0;
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

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading transaction data...</span>
        </div>
      </div>
    );
  }

  // 에러 상태 표시
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-center items-center p-8">
          <div className="text-red-500">Failed to load transaction data.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Table captionSide={captionSide}>
        <TableCaption>
          {caption}
          <div className="text-xs text-gray-500 mt-1">
            Page {currentPage}/{totalPages} (Total {total.toLocaleString()} transactions)
          </div>
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
                No data available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter />
      </Table>
      
      {/* 페이지네이션 조건부 렌더링 */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <BackofficePagination table={table} />
        </div>
      )}
      
      {/* 디버깅 정보 (개발 환경에서만 표시) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs text-gray-600">
          <div>Debug Information:</div>
          <div>Current Page: {currentPage}</div>
          <div>Total Pages: {totalPages}</div>
          <div>Total Data Count: {total}</div>
          <div>Page Size: {pageSize}</div>
          <div>Table Page Count: {table.getPageCount()}</div>
        </div>
      )}
    </div>
  );
};

export { TxsTable, TxsStats };
