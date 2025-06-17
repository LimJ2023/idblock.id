import { SiteVisitReview } from "@/api/site.review.api";
import type { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";

const columns: ColumnDef<SiteVisitReview>[] = [
  {
    id: "userNum",
    accessorKey: "id",
    header: () => <div className="text-center">No</div>,
    cell: (row) => (
      <div className="rounded-md bg-[#415776] p-1 px-2 text-center text-white">
        {row.getValue<string>()}
      </div>
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
    cell: (row) => {
      const rawDate = row.getValue<string>();
      const formattedDate = dayjs(rawDate).format("YYYY-MM-DD HH:mm:ss");

      return <div className="text-center text-[#333333]">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "content",
    header: () => <div className="text-center">후기</div>,
    cell: (row) => (
      <div className="w-full text-left text-[#333333]">
        {row.getValue<string>()}
      </div>
    ),
  },
];

export { columns };
