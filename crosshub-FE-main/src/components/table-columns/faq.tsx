import { Checkbox } from "@/components/ui/checkbox";

import { FAQDialog } from "@/components/dialogs/faq";

import type { ColumnDef } from "@tanstack/react-table";

import type { FAQ } from "@/api/faq.api";

const columns: ColumnDef<FAQ>[] = [
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
      const faq = row.getValue<FAQ>();

      return (
        <div className="flex min-h-6 items-center justify-center">
          <FAQDialog key={faq.id} data={{ type: "edit", faq }} />
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
