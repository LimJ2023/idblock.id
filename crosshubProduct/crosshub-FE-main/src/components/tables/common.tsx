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

import { ColumnDef } from "@tanstack/react-table";

import type { ErrorResponse } from "@/api/common.api";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  result: Result<TData[], ErrorResponse>;
  caption?: string;
  captionSide?: "top" | "bottom";
};

type DataTableWithoutDataProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  caption?: string;
  captionSide?: "top" | "bottom";
};

const ErrorTable = <TData, TValue>({
  columns,
  caption,
  captionSide,
  error,
}: DataTableWithoutDataProps<TData, TValue> & { error: Error }) => {
  const table = useReactTable({
    columns,
    data: [],
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
        <TableRow>
          <TableCell className="text-center" colSpan={columns.length}>
            {error.message}
          </TableCell>
        </TableRow>
      </TableBody>
      <TableFooter />
    </Table>
  );
};

const LoadingTable = <TData, TValue>({
  columns,
  caption,
  captionSide,
}: DataTableWithoutDataProps<TData, TValue>) => {
  const table = useReactTable({
    columns,
    data: [],
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
        <TableRow>
          <TableCell className="text-center" colSpan={columns.length}>
            로딩 중...
          </TableCell>
        </TableRow>
      </TableBody>
      <TableFooter />
    </Table>
  );
};

export { ErrorTable, LoadingTable };
export type { DataTableProps, DataTableWithoutDataProps };
