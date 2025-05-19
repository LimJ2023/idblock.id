import { Tx } from "@/api/polygon.api";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow, fromUnixTime } from "date-fns";
import { Link } from "react-router-dom";

const columns: ColumnDef<Tx>[] = [
  {
    accessorKey: "hash",
    header: () => (
      <div className="max-w-32items-center min-h-6 justify-center">TxHash</div>
    ),
    cell: (row) => (
      <Link to={`/tx/${row.getValue<string>()}`}>
        <div className="min-h-6 max-w-32 items-center overflow-hidden text-ellipsis whitespace-nowrap font-bold text-primary">
          {row.getValue<number>()}
        </div>
      </Link>
    ),
  },
  {
    accessorKey: "blockNumber",
    // accessorFn: (faq) => faq,
    header: () => (
      <div className="flex min-h-6 items-center justify-center">Block</div>
    ),
    cell: (row) => {
      return (
        <div className="flex min-h-6 items-center justify-center">
          {row.getValue<string>()}
        </div>
      );
    },
  },
  {
    accessorKey: "timeStamp",
    header: () => (
      <div className="flex min-h-6 items-center justify-center">Age</div>
    ),
    cell: (row) => (
      <div className="flex min-h-6 items-center justify-center">
        {formatDistanceToNow(
          new Date(fromUnixTime(Number(row.getValue<string>()))),
        )}
      </div>
    ),
  },

  {
    accessorKey: "from",
    header: () => (
      <div className="max-w-32items-center min-h-6 justify-center">From</div>
    ),
    cell: (row) => (
      <div className="min-h-6 max-w-32 items-center overflow-hidden text-ellipsis whitespace-nowrap">
        {row.getValue<string>()}
      </div>
    ),
  },
  {
    id: "IN",
    header: () => (
      <div className="flex min-h-6 items-center justify-center"></div>
    ),
    cell: () => (
      <span className="w-full rounded-md border border-emerald-600 border-opacity-25 bg-emerald-600/10 px-1.5 py-1.5 text-xs text-emerald-600">
        IN
      </span>
    ),
  },
  {
    accessorKey: "to",
    header: () => (
      <div className="max-w-32items-center min-h-6 justify-center">To</div>
    ),
    cell: (row) => (
      <div className="min-h-6 max-w-32 items-center overflow-hidden text-ellipsis whitespace-nowrap">
        {row.getValue<string>()}
      </div>
    ),
  },

  {
    accessorKey: "value",
    header: () => (
      <div className="flex min-h-6 items-center justify-center">Amount</div>
    ),
    cell: (row) => (
      <div className="flex min-h-6 items-center justify-center gap-2">
        <span>{row.getValue<string>()}</span>
        <span>ETH</span>
      </div>
    ),
  },
  {
    accessorKey: "gasUsed",
    header: () => (
      <div className="flex min-h-6 items-center justify-center">Gas Used</div>
    ),
    cell: (row) => (
      <div className="flex min-h-6 items-center justify-center">
        {row.getValue<string>()}
      </div>
    ),
  },
];

export { columns };
