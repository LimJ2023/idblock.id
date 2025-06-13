import { Site } from "@/api/sites.api";
import type { ColumnDef } from "@tanstack/react-table";
import { RemoveSiteDialog } from "../dialogs/remove-site";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

const columns: ColumnDef<Site>[] = [
  {
    id: "siteNum",
    accessorKey: "id",
    header: () => <div className="text-center">No</div>,
    cell: (row) => <div className="text-center">{row.getValue<string>()}</div>,
  },
  {
    accessorKey: "name",
    header: () => <div className="text-center">이름</div>,
    cell: (row) => <div className="text-center">{row.getValue<string>()}</div>,
  },
  {
    accessorKey: "imageKey",
    header: () => <div className="text-center">사진</div>,
    cell: (row) => (
      <div className="max-w-24 text-center">
        <div className="box-content h-[72px] w-[72px] overflow-hidden rounded-full border border-[#E5E7EB]">
          <img
            src={row.getValue<string>()}
            alt="사진"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    ),
  },
  {
    accessorKey: "address",
    header: () => <div className="text-center">위치</div>,
    cell: (row) => <div className="text-center">{row.getValue<string>()}</div>,
  },
  {
    accessorKey: "description",
    header: () => <div className="text-center">설명</div>,
    cell: (row) => <div className="text-center">{row.getValue<string>()}</div>,
  },
  {
    id: "interact",
    accessorFn: ({ id }) => ({ id }),
    header: () => <div className="text-center">관리</div>,
    cell: (row) => {
      const { id } = row.getValue<{
        id: number;
        isVisible: boolean;
      }>();

      return (
        <div className="flex items-center gap-2">
          <Button
            asChild
            className="border border-[#D8D7DB] bg-[#F3F4F8] font-pretendard text-black hover:text-white"
          >
            <Link to={`/main/sites/edit/${id}`}>수정</Link>
          </Button>

          <div>
            <RemoveSiteDialog selected={id} />
          </div>
        </div>
      );
    },
  },
];

export { columns };
