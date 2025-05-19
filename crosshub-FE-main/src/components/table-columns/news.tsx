import { Checkbox } from "@/components/ui/checkbox";

import { NewsDialog } from "@/components/dialogs/news";

import type { ColumnDef } from "@tanstack/react-table";

import type { News } from "@/api/news.api";

const columns: ColumnDef<News>[] = [
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
    header: () => (
      <div className="flex min-h-6 items-center justify-center">번호</div>
    ),
    cell: (row) => (
      <div className="flex min-h-6 items-center justify-center">
        {row.getValue<number>()}
      </div>
    ),
  },
  {
    id: "title",
    accessorFn: (faq) => faq,
    header: () => (
      <div className="flex min-h-6 items-center justify-center">제목</div>
    ),
    cell: (row) => {
      const news = row.getValue<News>();

      return (
        <div className="flex min-h-6 items-center justify-center">
          <NewsDialog key={news.id} data={{ type: "edit", news }} />
        </div>
      );
    },
  },
  {
    accessorKey: "isVisible",
    header: () => (
      <div className="flex min-h-6 items-center justify-center">
        진열/미진열
      </div>
    ),
    cell: (row) => (
      <div className="flex min-h-6 items-center justify-center">
        {row.getValue<boolean>() ? "진열됨" : "미진열"}
      </div>
    ),
  },
];

export { columns };
