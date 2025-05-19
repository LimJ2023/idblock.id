import { HTTPError } from "ky";

import { api } from "@/lib/ky-instance";
import { Failure, Success } from "@/lib/utils";

import type { ErrorResponse } from "@/api/common.api";

type News = {
  id: number;
  title: string;
  href: string;
  isVisible: boolean;
  createdAt: string;
};

type AddNews = Omit<News, "id" | "createdAt">;

const getNews: () => Promise<Result<News[], ErrorResponse>> = async () => {
  try {
    const json = await api.get("news").json<News[]>();

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

const createNews: (
  createData: AddNews,
) => Promise<Result<null, ErrorResponse>> = async (createData) => {
  try {
    await api.post("news", {
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

const updateNews: (
  updateData: { id: number } & AddNews,
) => Promise<Result<null, ErrorResponse>> = async (updateData) => {
  const { id, title, href, isVisible } = updateData;

  try {
    await api.put(`news/${id}`, {
      json: { title, href, isVisible },
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

const deleteNews: (deleteData: {
  id: number;
}) => Promise<Result<null, ErrorResponse>> = async (deleteData) => {
  const { id } = deleteData;

  try {
    await api.delete(`news/${id}`);

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

const deleteMultipleNews: (deleteData: {
  ids: number[];
}) => Promise<PromiseSettledResult<Result<null, ErrorResponse>>[]> = async (
  deleteData,
) => {
  const { ids } = deleteData;

  return await Promise.allSettled(ids.map((id) => deleteNews({ id })));
};

export { createNews, deleteMultipleNews, deleteNews, getNews, updateNews };
export type { AddNews, News };
