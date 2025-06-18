import { HTTPError } from "ky";

import { api } from "@/lib/ky-instance";

import { Failure, Success } from "@/lib/utils";

import { ErrorResponse } from "@/api/common.api";
import { getQueryClient } from "@/queries/get-query-client";

type AdminLogin = {
  email: string;
  password: string;
};

type AdminEmail = {
  email: string;
};

const postLogin = async (loginData: AdminLogin) => {
  try {
    await api.post("admin-auth/login", {
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

const getAuthStatus: () => Promise<Result<null, ErrorResponse>> = async () => {
  try {
    await api.get("admin-auth/protected");

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

const logout = async () => {
  try {
    await api.delete("admin-auth/logout");

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

const deleteUser = async (emailData: AdminEmail) => {
  try {
    await api.post("auth/delete-user", {
      json: emailData,
    });

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

export { getAuthStatus, logout, postLogin, deleteUser };
export type { AdminLogin };
