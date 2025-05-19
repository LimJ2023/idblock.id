import { format } from "date-fns";

import { Button } from "@/components/ui/button";

import type { ColumnDef } from "@tanstack/react-table";

import type { Coin } from "@/api/coins.api";
import { cn } from "@/lib/utils";

const columns: ColumnDef<Coin>[] = [
  {
    id: "coinNum",
    accessorKey: "id",
    header: () => <div className="text-center">No</div>,
    cell: (row) => <div className="text-center">{row.getValue<number>()}</div>,
  },
  {
    accessorKey: "name",
    header: () => <div className="text-center">코인 한글명</div>,
    cell: (row) => <div className="text-center">{row.getValue<string>()}</div>,
  },
  {
    accessorKey: "company",
    header: () => <div className="text-center">기업명</div>,
    cell: (row) => <div className="text-center">{row.getValue<string>()}</div>,
  },
  {
    accessorKey: "isVisible",
    header: () => <div className="text-center">상태</div>,
    cell: (row) => {
      const value = row.getValue<boolean>();
      return <div className="text-center">{value ? "상장됨" : "상장안됨"}</div>;
    },
  },
  {
    id: "interact",
    accessorFn: ({ id, isVisible }) => ({ id, isVisible }),
    header: () => <div className="text-center">상장</div>,
    cell: (row) => {
      const { id, isVisible } = row.getValue<{
        id: number;
        isVisible: boolean;
      }>();

      return (
        <div className="flex flex-col items-center">
          <Button
            variants="secondary"
            onClick={() =>
              console.log(`${id} 상장 ${isVisible ? "중지" : "하기"}`)
            }
            className={cn(
              "border border-neutral-400 bg-background font-pretendard text-neutral-600",
              "hover:bg-background/10",
            )}
          >{`상장 ${isVisible ? "중지" : "하기"}`}</Button>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: () => <div className="text-center">프로젝트 구분</div>,
    cell: (row) => <div className="text-center">{row.getValue<string>()}</div>,
  },
  {
    accessorKey: "category",
    header: () => <div className="text-center">카테고리</div>,
    cell: (row) => <div className="text-center">{row.getValue<string>()}</div>,
  },
  {
    id: "duration",
    accessorFn: ({ startDate, endDate }) => ({ startDate, endDate }),
    header: () => <div className="text-center">기간</div>,
    cell: (row) => {
      const { startDate, endDate } = row.getValue<{
        startDate: string;
        endDate: string;
      }>();

      return (
        <div className="flex flex-col items-center">
          <div className="flex flex-col">
            <span>{format(startDate, "yyyy.MM.dd")} ~</span>
            <span>{format(endDate, "yyyy.MM.dd")}</span>
          </div>
        </div>
      );
    },
  },
];

export { columns };
