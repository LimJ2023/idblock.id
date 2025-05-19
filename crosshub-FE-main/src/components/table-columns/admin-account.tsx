import { RemoveAdminAccountDialog } from "@/components/dialogs/remove-admin-account";
import { ResetAdminPasswordDialog } from "@/components/dialogs/reset-admin-password";

import type { ColumnDef } from "@tanstack/react-table";

import type { Admin, AdminRole } from "@/api/admin.api";

const columns: ColumnDef<Admin>[] = [
  {
    id: "userNum",
    accessorKey: "id",
    header: () => <div className="text-center">No</div>,
    cell: (row) => <div className="text-center">{row.getValue<number>()}</div>,
  },
  {
    accessorKey: "email",
    header: () => <div className="text-center">ID</div>,
    cell: (row) => <div className="text-center">{row.getValue<number>()}</div>,
  },
  {
    accessorKey: "name",
    header: () => <div className="text-center">이름</div>,
    cell: (row) => <div className="text-center">{row.getValue<number>()}</div>,
  },
  {
    accessorKey: "role",
    header: () => <div className="text-center">권한</div>,
    cell: (row) => {
      const value = row.getValue<AdminRole>();
      return (
        <div className="text-center">
          {value === "NORMAL" ? "관리자" : "마스터"}
        </div>
      );
    },
  },
  {
    id: "interact",
    accessorFn: ({ id, name }) => ({ id, name }),
    header: () => <div className="text-center">관리</div>,
    cell: (row) => {
      const { id, name } = row.getValue<{ id: number; name: string }>();

      return (
        <div className="flex flex-col items-center">
          <ResetAdminPasswordDialog id={id} />
          <RemoveAdminAccountDialog id={id} name={name} />
        </div>
      );
    },
  },
];

export { columns };
