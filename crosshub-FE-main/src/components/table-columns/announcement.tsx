import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { cn } from "@/lib/utils";

import type { ColumnDef } from "@tanstack/react-table";

import type { Announcement } from "@/api/announcement.api";
import { Link } from "react-router-dom";

const columns: ColumnDef<Announcement>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex min-h-6 items-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex min-h-6 items-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
  },
  {
    accessorKey: "id",
    header: () => <div className="text-center">No</div>,
    cell: (row) => <div className="text-center">{row.getValue<number>()}</div>,
  },
  {
    accessorKey: "title",
    header: () => <div className="text-center">제목</div>,
    cell: (row) => (
      <div className="flex items-center justify-center">
        {row.getValue<string>()}
      </div>
    ),
  },
  {
    id: "thumbnail",
    accessorFn: ({ id, thumbnail }) => ({ id, thumbnail }),
    header: () => <div className="text-center">썸네일</div>,
    cell: (row) => {
      const { id, thumbnail } = row.getValue<{
        id: number;
        thumbnail: string;
      }>();

      return (
        <div className="flex items-center justify-center">
          <img
            className="h-10 w-10 object-cover"
            src={thumbnail}
            alt={`${id}번 게시물 썸네일`}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-center">등록일</div>,
    cell: (row) => (
      <div className="text-center">
        {format(row.getValue<string>(), "yyyy-MM-dd")}
      </div>
    ),
  },
  {
    id: "edit",
    accessorKey: "id",
    header: () => <></>,
    cell: (row) => (
      <div className="text-center">
        <Button
          variants="secondary"
          className={cn(
            "rounded-lg border bg-white font-pretendard text-neutral-600",
            "hover:bg-neutral-200",
          )}
          asChild
        >
          <Link to={`edit/${row.getValue<number>()}`}>수정하기</Link>
        </Button>
      </div>
    ),
  },
];

export { columns };
