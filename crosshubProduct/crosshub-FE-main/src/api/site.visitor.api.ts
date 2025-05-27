import { HTTPError } from "ky";

import { api } from "@/lib/ky-instance";

import { Failure, Success } from "@/lib/utils";

import type { ErrorResponse } from "@/api/common.api";

type SiteVisitor = {
  id: string;
  userId: string;
  siteId: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    countryCode: string;
    birthday: string;
    passportNumber: string;
    approvalId: string;
    cityId: string;
  };
};

type VisitorCandidate = {
  id: string;
  email: string;
  name: string;
  countryCode: string;
  birthday: string;
  passportNumber: string;
  approvalId: string;
  cityId: string;
  profileImageKey: string;
  txHash: string;
};

const getVisitors: () => Promise<
  Result<SiteVisitor[], ErrorResponse>
> = async () => {
  try {
    const json = await api.get("visitor", {}).json<{ data: SiteVisitor[] }>();

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

const getVisitorById: (
  i: string,
) => Promise<Result<VisitorCandidate, ErrorResponse>> = async (id: string) => {
  try {
    const json = await api
      .get(`visitor/${id}`, {})
      .json<{ data: VisitorCandidate }>();

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

const acceptVisitor: (
  v: string,
) => Promise<Result<VisitorCandidate, ErrorResponse>> = async (
  visitorId: string,
) => {
  try {
    const json = await api
      .post(`visitor/${visitorId}`, {})
      .json<{ data: VisitorCandidate }>();

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

export { getVisitors, getVisitorById, acceptVisitor };

export type { ErrorResponse, SiteVisitor };
