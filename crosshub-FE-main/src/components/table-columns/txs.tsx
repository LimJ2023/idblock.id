import { Tx } from "@/api/polygon.api";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import dayjs from "dayjs";

// Wei를 ETH로 변환하는 함수
function weiToEth(weiValue: string | undefined): string {
  // undefined, null, 빈 문자열 체크
  if (!weiValue || weiValue === "" || weiValue === "0") {
    return "0.000000";
  }
  
  try {
    const wei = BigInt(weiValue);
    const eth = Number(wei) / 1e18;
    return eth.toFixed(6);
  } catch (error) {
    console.warn("Wei 변환 에러:", error, "값:", weiValue);
    return "0.000000";
  }
}

const columns: ColumnDef<Tx>[] = [
  {
    accessorKey: "hash",
    header: () => (
      <div className="max-w-32items-center min-h-6 justify-center">TxHash</div>
    ),
    cell: (row) => (
      <Link to={`/tx/${row.getValue<string>()}`}>
        <div className="min-h-6 max-w-32 items-center overflow-hidden text-ellipsis whitespace-nowrap font-bold text-primary">
          {row.getValue<string>()}
        </div>
      </Link>
    ),
  },
  {
    accessorKey: "blockNumber",
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
      <div className="flex min-h-6 items-center justify-center">Timestamp</div>
    ),
    cell: (row) => {
      const timestamp = row.getValue<string>();
      // Unix timestamp (초 단위)를 Date 객체로 변환
      const date = dayjs(parseInt(timestamp) * 1000);
      const formattedDate = date.format("YYYY-MM-DD HH:mm:ss");
      
      return (
        <div className="flex min-h-6 items-center justify-center">
          {formattedDate}
        </div>
      );
    },
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
        <span>{weiToEth(row.getValue<string>())}</span>
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
