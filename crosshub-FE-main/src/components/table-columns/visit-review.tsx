import { SiteVisitReview } from "@/api/site.review.api";
import type { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<SiteVisitReview>[] = [
  {
    id: "userNum",
    accessorKey: "id",
    header: () => <div className="text-center">No</div>,
    cell: (row) => (
      <div className="text-center text-[#333333]">{row.getValue<string>()}</div>
    ),
  },
  {
    accessorKey: "user.name",
    header: () => <div className="text-center">이름</div>,
    cell: (row) => (
      <div className="text-center text-[#333333]">{row.getValue<string>()}</div>
    ),
  },
  {
    accessorKey: "user.countryCode",
    header: () => <div className="text-center">국가</div>,
    cell: (row) => (
      <div className="text-center text-[#333333]">{row.getValue<string>()}</div>
    ),
  },
  {
    accessorKey: "user.cityId",
    header: () => <div className="text-center">명예시민</div>,
    cell: (row) => (
      <div className="text-center text-[#333333]">{row.getValue<string>()}</div>
    ),
  },
  {
    accessorKey: "visit.createdAt",
    header: () => <div className="text-center">방문일시</div>,
    cell: (row) => (
      <div className="text-center text-[#333333]">{row.getValue<string>()}</div>
    ),
  },
  {
    accessorKey: "content",
    header: () => <div className="text-center">후기</div>,
    cell: (row) => (
      <div className="max-w-xs truncate text-center text-[#333333]">
        {row.getValue<string>()}
      </div>
    ),
  },
];

export { columns };
