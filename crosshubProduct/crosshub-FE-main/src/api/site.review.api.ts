import { HTTPError } from "ky";

import { api } from "@/lib/ky-instance";

import { Failure, Success } from "@/lib/utils";

import type { ErrorResponse } from "@/api/common.api";

type SiteVisitReview = {
  id: string;
  visitId: string;
  content: string;
  createdAt: string;
  visit: {
    id: string;
    userId: string;
    siteId: string;
    createdAt: string;
  };
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

const getReviews: () => Promise<
  Result<SiteVisitReview[], ErrorResponse>
> = async () => {
  try {
    const json = await api
      .get("review", {})
      .json<{ data: SiteVisitReview[] }>();

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

export { getReviews };

export type { ErrorResponse, SiteVisitReview };
