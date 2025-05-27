import { HTTPError } from "ky";

import { api } from "@/lib/ky-instance";

import { ErrorResponse } from "@/api/common.api";
import { Failure, Success } from "@/lib/utils";

type FAQ = {
  id: number;
  title: string;
  content: string;
  sortOrder: number;
  isVisible: boolean;
};

type AddFAQ = Omit<FAQ, "id" | "sortOrder">;

const getFAQs: () => Promise<Result<FAQ[], ErrorResponse>> = async () => {
  try {
    const json = await api.get("faq").json<FAQ[]>();

    return Success(json.toSorted((a, b) => a.sortOrder - b.sortOrder));
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

const createFAQ: (
  createData: AddFAQ,
) => Promise<Result<null, ErrorResponse>> = async (createData) => {
  try {
    await api.post("faq", {
      json: createData,
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

const updateFAQ: (
  updateData: { id: number } & AddFAQ,
) => Promise<Result<null, ErrorResponse>> = async (updateData) => {
  const { id, title, content, isVisible } = updateData;

  try {
    await api.put(`faq/${id}`, {
      json: { title, content, isVisible },
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

const deleteFAQ: (deleteData: {
  id: number;
}) => Promise<Result<null, ErrorResponse>> = async (deleteData) => {
  const { id } = deleteData;

  try {
    await api.delete(`faq/${id}`);

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

const deleteMultipleFAQs: (deleteData: {
  ids: number[];
}) => Promise<PromiseSettledResult<Result<null, ErrorResponse>>[]> = async (
  deleteData,
) => {
  const { ids } = deleteData;

  return await Promise.allSettled(ids.map((id) => deleteFAQ({ id })));
};

const reorderFAQs: (reorderData: {
  ids: number[];
}) => Promise<Result<null, ErrorResponse>> = async (reorderData) => {
  const { ids } = reorderData;

  try {
    await api.patch("faq/reorder", { json: { ids } });

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

export {
  createFAQ,
  deleteFAQ,
  deleteMultipleFAQs,
  getFAQs,
  reorderFAQs,
  updateFAQ,
};

export type { AddFAQ, FAQ };
