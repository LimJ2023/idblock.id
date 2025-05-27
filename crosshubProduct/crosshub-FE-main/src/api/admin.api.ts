import { HTTPError } from "ky";

import { api } from "@/lib/ky-instance";

import { Failure, Success } from "@/lib/utils";

import type { ErrorResponse } from "@/api/common.api";

type AdminRole = "NORMAL" | "SUPER";

type Admin = {
  id: number;
  email: string;
  name: string;
  role: AdminRole;
};

type AddAdmin = {
  email: string;
  password: string;
  name: string;
};

type ResetAdminPassword = {
  id: number;
  password: string;
};

type RemoveAdmin = {
  id: number;
};

const getAdmins: () => Promise<Result<Admin[], ErrorResponse>> = async () => {
  try {
    const json = await api.get("super-admin").json<Admin[]>();

    return Success(json);
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

const createAdmin: (
  createData: AddAdmin,
) => Promise<Result<null, string>> = async (createData) => {
  try {
    await api.post("super-admin", {
      json: createData,
    });

    return Success(null);
  } catch (e) {
    if (e instanceof HTTPError) {
      return Failure(e.message);
    }

    return Failure("Something went wrong");
  }
};

const resetAdminPassword: (
  resetPasswordData: ResetAdminPassword,
) => Promise<Result<null, string>> = async (resetPasswordData) => {
  const { id, password } = resetPasswordData;

  try {
    await api.patch(`super-admin/${id}`, {
      json: { password },
    });

    return Success(null);
  } catch (e) {
    if (e instanceof HTTPError) {
      return Failure(e.message);
    }

    return Failure("Something went wrong");
  }
};

const removeAdmin: (
  removeAdminData: RemoveAdmin,
) => Promise<Result<null, string>> = async (removeAdminData) => {
  const { id } = removeAdminData;

  try {
    await api.delete(`super-admin/${id}`);

    return Success(null);
  } catch (e) {
    if (e instanceof HTTPError) {
      return Failure(e.message);
    }

    return Failure("Something went wrong");
  }
};

export { createAdmin, getAdmins, removeAdmin, resetAdminPassword };

export type { AddAdmin, Admin, AdminRole, RemoveAdmin, ResetAdminPassword };

export type { ErrorResponse };
