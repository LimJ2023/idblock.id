import { deleteUser, getUserDetail, getUsers } from "@/api/users.api";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export type StatusFilter = "OPENED" | "APPROVED" | "REJECTED" | "REOPENED";

const users = createQueryKeys("users", {
  all: (status: StatusFilter = "OPENED") => ({
    queryKey: [status],
    queryFn: () => getUsers(status),
  }),

  detail: (documentId: string) => ({
    queryKey: [documentId],
    queryFn: () => getUserDetail(documentId),
  }),

  delete: (documentId: string) => ({
    queryKey: [documentId],
    queryFn: () => deleteUser(documentId),
  }),
});

export { users };
