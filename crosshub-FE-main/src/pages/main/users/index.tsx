import { Outlet } from "react-router-dom";
import { UsersListPage } from "./list";

const UsersPage = () => {
  return <Outlet />;
};

export { UsersPage, UsersListPage };
