import { HTTPError } from "ky";

// import { api } from "@/lib/ky-instance";

import { Failure, Success } from "@/lib/utils";

import type { ErrorResponse } from "@/api/common.api";

type Coin = {
  id: number;
  name: string;
  company: string;
  isVisible: boolean;
  type: string;
  category: string;
  startDate: string;
  endDate: string;
};

const dummy: Coin[] = [
  {
    id: 3,
    name: "$코인 한글명$",
    company: "$기업명$",
    isVisible: true,
    type: "$프로젝트 구분",
    category: "나무심기",
    startDate: new Date(Date.now()).toISOString(),
    endDate: new Date(Date.now()).toISOString(),
  },
  {
    id: 2,
    name: "$코인 한글명$",
    company: "$기업명$",
    isVisible: false,
    type: "$프로젝트 구분",
    category: "나무심기",
    startDate: new Date(Date.now()).toISOString(),
    endDate: new Date(Date.now()).toISOString(),
  },
  {
    id: 1,
    name: "남양주시 진전읍 산림경영사업",
    company: "폐기물 수집 운반 업체 청호 자원",
    isVisible: false,
    type: "$프로젝트 구분",
    category: "나무심기",
    startDate: new Date(Date.now()).toISOString(),
    endDate: new Date(Date.now()).toISOString(),
  },
];

const getCoins: () => Promise<Result<Coin[], ErrorResponse>> = async () => {
  try {
    // const json = await api.get("faq").json<Coin[]>();

    return Success(dummy);
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

export { getCoins };
export type { Coin };
