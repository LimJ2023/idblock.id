import { HTTPError } from "ky";

import { api } from "@/lib/ky-instance";

import { Failure, Success } from "@/lib/utils";

import type { ErrorResponse } from "@/api/common.api";

type User = {
  id: string;
  userId: string;
  passportImageKey: string;
  profileImageKey: string;
  createdAt: string;
  approvalStatus: number;
  rejectReason: null;
  email: string;
  name: string;
  countryCode: string;
  birthday: string;
  passportNumber: string;
  approvalId: null | string;
  cityId: string;
  screenReplay: number | null;
  paperPrinted: number | null;
  replacePortraits: number | null;
  matchSimilarity: number | null;
  matchConfidence: number | null;
  faceLiveness: number | null;
  documentId: string;
};

type RejectUser = {
  documentId: string;
  reason: string;
};

const getUsers: (s: string) => Promise<Result<User[], ErrorResponse>> = async (
  status,
) => {
  try {
    const json = await api
      .get("user", {
        searchParams: { status },
      })
      .json<{ data: User[] }>();

    return Success(json.data);
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
const getUserDetail: (
  id: string,
) => Promise<Result<User, ErrorResponse>> = async (documentId) => {
  try {
    const json = await api.get(`user/${documentId}`, {}).json<{ data: User }>();

    return Success(json.data);
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

const argosCall = async (documentId: string) => {
  try {
    const json = await api
      .post("user/argos-id-liveness", {
        json: { documentId },
      })
      .json<{ data: string }>();

    return Success(json.data);
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
const approveUser = async (documentId: string) => {
  try {
    await api.post(`user/approve`, {
      json: { documentId },
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

const rejectUser = async ({ documentId, reason }: RejectUser) => {
  try {
    await api.patch(`user/reject`, {
      json: { documentId, reason },
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

const deleteUser = async (documentId: string) => {
  try {
    await api.delete(`user/${documentId}`);
  } catch (e) {
    if (e instanceof HTTPError) {
      return Failure(await e.response.json<ErrorResponse>());
    }
  }
};

export {
  getUsers,
  approveUser,
  rejectUser,
  getUserDetail,
  argosCall,
  deleteUser,
};

export type { ErrorResponse, User, RejectUser };
