import { HTTPError } from "ky";

import { api, multipartApi } from "@/lib/ky-instance";

import { Failure, Success } from "@/lib/utils";

import type { ErrorResponse } from "@/api/common.api";
type Site = {
  id: string;
  name: string;
  thumbnail: { url: string; key: string };
  address: string;
  description: string;
};

type SiteManager = {
  email: string;
  password: string;
  passwordCheck: string;
};

type SiteDetail = {
  id: string;
  name: string;
  imageKey: string;
  address: string;
  description: string;
  siteManager: SiteManager;
} & { thumbnail: { url: string; key: string } };

type Image = {
  file: File;
};

type AddSite = Omit<Site & SiteManager, "id">;

const getSites: () => Promise<Result<Site[], ErrorResponse>> = async () => {
  try {
    const json = await api.get("site").json<{ data: Site[] }>();

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
const getSite: (
  id: string,
) => Promise<Result<SiteDetail, ErrorResponse>> = async (id) => {
  try {
    const json = await api.get(`site/${id}`).json<{ data: SiteDetail }>();

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
const updateSite: (
  updateData: SiteDetail,
) => Promise<Result<null, ErrorResponse>> = async (updateData) => {
  const { name, address, description, siteManager, thumbnail, id } = updateData;

  try {
    await api.put(`site/${id}`, {
      json: {
        name,
        address,
        description,
        imageKey: thumbnail.key,
        email: siteManager.email,
        password: siteManager.password,
        passwordCheck: siteManager.passwordCheck,
      },
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
      .post("site/thumbnail", { body: formData })
      .json<{ data: { url: string; key: string } }>();

    return Success(result.data);
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
const createSite: (
  createData: AddSite,
) => Promise<Result<null, ErrorResponse>> = async (createData) => {
  const {
    address,
    description,
    thumbnail,
    name,
    email,
    password,
    passwordCheck,
  } = createData;

  try {
    await api.post("site", {
      json: {
        name,
        imageKey: thumbnail.key,
        address,
        description,
        email,
        password,
        passwordCheck,
      },
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

const deleteSite: (deleteData: {
  id: number;
}) => Promise<Result<null, ErrorResponse>> = async (deleteData) => {
  const { id } = deleteData;

  try {
    await api.delete(`site/${id}`);

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
  getSite,
  getSites,
  uploadThumbnail,
  createSite,
  deleteSite,
  updateSite,
};

export type { ErrorResponse, Site, SiteDetail, AddSite };
