import { HTTPError } from "ky";

import { api } from "@/lib/ky-instance";

import { Failure, Success } from "@/lib/utils";

import { ErrorResponse } from "@/api/common.api";
import { getQueryClient } from "@/queries/get-query-client";

type ManagerLogin = {
  email: string;
  password: string;
};

const postManagerLogin = async (loginData: ManagerLogin) => {
  try {
    await api.post("manager-auth/login", {
      json: loginData,
    });
    getQueryClient().invalidateQueries();

    return Success(null);
  } catch (e) {
    if (e instanceof HTTPError) {
      return Failure(e.message);
    }

    return Failure("Something went wrong");
  }
};

const getManagerAuthStatus: () => Promise<
  Result<null, ErrorResponse>
> = async () => {
  try {
    await api.get("manager-auth/protected");

    return Success(null);
  } catch (e) {
    if (e instanceof HTTPError) {
      getQueryClient().invalidateQueries({
        queryKey: [],
        exact: false,
      });
      return Failure(await e.response.json<ErrorResponse>());
    }

    return Failure({
      message: "Something went wrong!",
      error: "Error",
      statusCode: -1,
    });
  }
};

const mangerLogout = async () => {
  try {
    await api.delete("manager-auth/logout");

    return Success(null);
  } catch (e) {
    if (e instanceof HTTPError) {
      return Failure(await e.response.json<ErrorResponse>());
    }

    return Failure({
      message: "Something went wrong!",
      error: "Error",
      statusCode: -1,
    });
  }
};

export { getManagerAuthStatus, mangerLogout, postManagerLogin };
export type { ManagerLogin };
