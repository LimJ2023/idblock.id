import { User } from "@/api/users.api";
import type { ColumnDef } from "@tanstack/react-table";
import { ApproveUserDialog } from "../dialogs/approve-user";
import { RejectUserDialog } from "../dialogs/reject-user";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { DeleteUserDialog } from "../dialogs/delete-user";
import { CircleCheck, CircleMinus } from "lucide-react";

const columns = (refetch: () => void): ColumnDef<User>[] => [
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
        <div className="max-w-24 text-center">
          <div className="box-content h-[72px] w-[72px] overflow-hidden rounded-full border border-[#E5E7EB]">
            <img
              src={row.getValue<string>()}
              alt="passport"
              className="h-full w-full object-cover"
            />
          </div>
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
          <div className="box-content h-[72px] w-[72px] overflow-hidden rounded-full border border-[#E5E7EB]">
            <img
              src={row.getValue<string>()}
              alt="profile"
              className="h-full w-full object-cover"
            />
          </div>
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
              <ApproveUserDialog selected={id} onSuccess={refetch} />
              <RejectUserDialog id={id} onSuccess={refetch} />
              {/* <Button
                variants="secondary"
                className="border border-[#FFF6CC] bg-[#FFFBE5] font-pretendard text-[#FFD400] hover:bg-[#FFD400] hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <CircleMinus />
                취소
              </Button> */}
            </>
          ) : approvalStatus === 1 ? (
            <>
              <Button
                variants="secondary"
                className="border border-[#CEE9D4] bg-[#EEF7F0] font-pretendard text-[#008A1E] hover:bg-[#008A1E] hover:text-white disabled:border-0 disabled:text-[#EEEEEE]"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                disabled
              >
                <CircleCheck />
                승인
              </Button>
              {/* <Button
                variants="secondary"
                className="border border-[#FFF6CC] bg-[#FFFBE5] font-pretendard text-[#FFD400] hover:bg-[#FFD400] hover:text-white disabled:text-[#EEEEEE]"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <CircleMinus />
                거절
              </Button> */}

              <DeleteUserDialog selected={id} onSuccess={refetch} />
            </>
          ) : (
            <>
              {/* <Button
                variants="secondary"
                className="border border-[#CEE9D4] bg-[#EEF7F0] font-pretendard text-[#008A1E] hover:bg-[#008A1E] hover:text-white disabled:text-[#EEEEEE]"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                disabled
              >
                <CircleCheck />
                승인
              </Button> */}
              <Button
                variants="secondary"
                className="border border-[#FFF6CC] bg-[#FFFBE5] font-pretendard text-[#FFD400] hover:bg-[#FFD400] hover:text-white disabled:border-0 disabled:text-[#EEEEEE]"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                disabled
              >
                <CircleMinus />
                거절
              </Button>
              {/* <Button
                variants="secondary"
                className="border border-[#FCCCCC] bg-[#FEF1F1] font-pretendard text-[#EE0000] hover:bg-[#EE0000] hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <CircleX />
                삭제
              </Button> */}

              <DeleteUserDialog selected={id} onSuccess={refetch} />
            </>
          )}
        </div>
      );
    },
  },
];

export { columns };
