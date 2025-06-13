import type { ColumnDef } from "@tanstack/react-table";
import { SiteVisitor } from "@/api/site.visitor.api";

const columns: ColumnDef<SiteVisitor>[] = [
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
    accessorKey: "createdAt",
    header: () => <div className="text-center">방문일시</div>,
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
    accessorKey: "user.birthday",
    header: () => <div className="text-center">생년월일</div>,
    cell: (row) => (
      <div className="text-center text-[#333333]">{row.getValue<string>()}</div>
    ),
  },
];

export { columns };
