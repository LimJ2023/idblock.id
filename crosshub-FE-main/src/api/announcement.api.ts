import { HTTPError } from "ky";

import { api, multipartApi } from "@/lib/ky-instance";
import { Failure, Success } from "@/lib/utils";

import { ErrorResponse } from "@/api/common.api";

type Announcement = {
  id: number;
  title: string;
  content: string;
  thumbnail: { url: string; key: string };
  createdAt: string;
};

type AddAnnouncement = Omit<Announcement, "id" | "createdAt">;

type AnnouncementDetail = {
  id: number;
  title: string;
  content: string;
  thumbnail: string;
};

type Image = {
  file: File;
};

const getAnnouncements: () => Promise<
  Result<Announcement[], ErrorResponse>
> = async () => {
  try {
    const json = await api.get("announcement").json<Announcement[]>();

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

const getAnnouncementDetail: (
  id: number,
) => Promise<Result<AnnouncementDetail, ErrorResponse>> = async (id) => {
  try {
    const json = await api.get(`announcement/${id}`).json<AnnouncementDetail>();

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

const createAnnouncement: (
  createData: AddAnnouncement & { summary: string },
) => Promise<Result<null, ErrorResponse>> = async (createData) => {
  const { title, content, thumbnail, summary } = createData;

  try {
    await api.post("announcement", {
      json: { title, content, thumbnail: thumbnail.key, summary },
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

const updateAnnouncement: (
  updateData: Omit<Announcement, "createdAt"> & { summary: string },
) => Promise<Result<null, ErrorResponse>> = async (updateData) => {
  const { title, content, thumbnail, id, summary } = updateData;

  try {
    await api.put(`announcement/${id}`, {
      json: { title, content, thumbnail: thumbnail.key, summary },
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

const uploadThumbnail: (
  fileData: Image,
) => Promise<Result<{ url: string; key: string }, ErrorResponse>> = async (
  fileData,
) => {
  const { file } = fileData;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const result = await multipartApi
      .post("announcement/thumbnail", { body: formData })
      .json<{ url: string; key: string }>();

    return Success(result);
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

const uploadEmbedded: (
  fileData: Image,
) => Promise<Result<{ url: string; key: string }, ErrorResponse>> = async (
  fileData,
) => {
  const { file } = fileData;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const result = await multipartApi
      .post("announcement/embedded", { body: formData })
      .json<{ url: string; key: string }>();

    return Success(result);
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

const deleteAnnouncement: (deleteData: {
  id: number;
}) => Promise<Result<null, ErrorResponse>> = async (deleteData) => {
  const { id } = deleteData;

  try {
    await api.delete(`announcement/${id}`);

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

const deleteMultiplAnnouncements: (deleteData: {
  ids: number[];
}) => Promise<PromiseSettledResult<Result<null, ErrorResponse>>[]> = async (
  deleteData,
) => {
  const { ids } = deleteData;

  return await Promise.allSettled(ids.map((id) => deleteAnnouncement({ id })));
};

export {
  createAnnouncement,
  deleteAnnouncement,
  deleteMultiplAnnouncements,
  getAnnouncementDetail,
  getAnnouncements,
  updateAnnouncement,
  uploadEmbedded,
  uploadThumbnail,
};
export type { AddAnnouncement, Announcement, AnnouncementDetail, Image };
