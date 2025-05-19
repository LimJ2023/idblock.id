import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
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

import type { ErrorResponse } from "@/api/common.api";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  result: Result<TData[], ErrorResponse>;
  caption?: string;
  captionSide?: "top" | "bottom";
}

const DataTable = <TData, TValue>({
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

  const table = useReactTable({
    columns,
    data: result.value,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
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
      <TableFooter />
    </Table>
  );
};

export { DataTable };
