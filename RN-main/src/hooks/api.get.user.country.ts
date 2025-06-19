import { useCallback } from "react";
import { Country } from "~/types/country";
import { HttpResponse } from "~/types/http.response";
import { useHttp } from "~/zustands/http";



export function useApiGetUserCountry () {
    const { get} = useHttp();

    const apiGetUserCountry = useCallback(async ({ code3 }: Params) => {
        const response: HttpResponse<Country> = await get('/v1/auth/country', {
            code3: code3,
        });

        return response?.data || null;
    },[]);

    return {
        apiGetUserCountry,
    }
}

interface Params {
    code3: string;
  }