import { User } from "@/api/users.api";
import type { ColumnDef } from "@tanstack/react-table";
import { ApproveUserDialog } from "../dialogs/approve-user";
import { RejectUserDialog } from "../dialogs/reject-user";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { DeleteUserDialog } from "../dialogs/delete-user";

const columns: ColumnDef<User>[] = [
  {
    id: "userNum",
    accessorKey: "id",
    header: () => <div className="text-center">No</div>,
    cell: (row) => (
      <Link
        to={`/main/users/${(row.row.original as { id: string }).id}`}
        className="flex h-full items-center justify-center"
      >
        <div className="text-center">{row.getValue<string>()}</div>
      </Link>
    ),
  },
  {
    accessorKey: "name",
    header: () => <div className="text-center">이름</div>,
    cell: (row) => (
      <Link
        to={`/main/users/${(row.row.original as { id: string }).id}`}
        className="flex h-full items-center justify-center"
      >
        <div className="text-center">{row.getValue<string>()}</div>
      </Link>
    ),
  },
  {
    accessorKey: "passportImageKey",
    header: () => <div className="text-center">여권</div>,
    cell: (row) => (
      <Link
        to={`/main/users/${(row.row.original as { id: string }).id}`}
        className="flex h-full items-center justify-center"
      >
        <div className="mx-auto max-w-24 text-center">
          <img
            src={row.getValue<string>()}
            alt="passport"
            className="mx-auto"
          />
        </div>
      </Link>
    ),
  },
  {
    accessorKey: "profileImageKey",
    header: () => <div className="text-center">얼굴 사진</div>,
    cell: (row) => (
      <Link
        to={`/main/users/${(row.row.original as { id: string }).id}`}
        className="flex h-full items-center justify-center"
      >
        <div className="mx-auto max-w-24 text-center">
          <img src={row.getValue<string>()} alt="profile" className="mx-auto" />
        </div>
      </Link>
    ),
  },
  {
    accessorKey: "countryCode",
    header: () => <div className="text-center">국가</div>,
    cell: (row) => (
      <Link
        to={`/main/users/${(row.row.original as { id: string }).id}`}
        className="flex h-full items-center justify-center"
      >
        <div className="text-center">{row.getValue<string>()}</div>
      </Link>
    ),
  },
  {
    accessorKey: "cityId",
    header: () => <div className="text-center">명예 시민</div>,
    cell: (row) => (
      <Link
        to={`/main/users/${(row.row.original as { id: string }).id}`}
        className="flex h-full items-center justify-center"
      >
        <div className="text-center">{row.getValue<string>()}</div>
      </Link>
    ),
  },
  {
    accessorKey: "passportNumber",
    header: () => <div className="text-center">여권번호</div>,
    cell: (row) => (
      <Link
        to={`/main/users/${(row.row.original as { id: string }).id}`}
        className="flex h-full items-center justify-center"
      >
        <div className="text-center">{row.getValue<string>()}</div>
      </Link>
    ),
  },
  {
    id: "interact",
    accessorFn: ({ id, approvalStatus }) => ({ id, approvalStatus }),
    header: () => <div className="text-center">승인여부</div>,
    cell: (row) => {
      const { id, approvalStatus } = row.getValue<{
        id: string;
        approvalStatus: number;
      }>();

      return (
        <div className="flex items-center justify-center gap-2">
          {approvalStatus === 0 ? (
            <>
              <ApproveUserDialog selected={id} />
              <RejectUserDialog id={id} />
              <Button
                variants="secondary"
                className="border border-[#D8D7DB] bg-orange-600 font-pretendard hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                취소
              </Button>
            </>
          ) : approvalStatus === 1 ? (
            <>
              <Button
                variants="secondary"
                className="border border-[#D8D7DB] bg-[#3A394D] font-pretendard hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                승인
              </Button>
              <Button
                variants="secondary"
                className="border border-[#D8D7DB] bg-[#3A394D] font-pretendard hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                disabled
              >
                거절
              </Button>

              <DeleteUserDialog selected={id} />

            </>
          ) : (
            <>
              <Button
                variants="secondary"
                className="border border-[#D8D7DB] bg-[#3A394D] font-pretendard hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                disabled
              >
                승인
              </Button>
              <Button
                variants="secondary"
                className="border border-[#D8D7DB] bg-[#3A394D] font-pretendard hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                거절
              </Button>
              <Button
                variants="secondary"
                className="border border-[#D8D7DB] bg-orange-600 font-pretendard hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                삭제
              </Button>
            </>
          )}
        </div>
      );
    },
  },
];

export { columns };
