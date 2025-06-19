import { useCallback } from "react";
import { City } from "~/types/city";
import { HttpResponse } from "~/types/http.response";
import { useHttp } from "~/zustands/http";


export function useApiGetUserCity () {
    const { get} = useHttp();

    const apiGetUserCity = useCallback(async ({ code }: Params) => {
        const response: HttpResponse<City> = await get('/v1/auth/city', {
            countryCode: code,
        });

        return response?.data || null;
    }, []);

    return {
        apiGetUserCity,
    }
}

interface Params {
    code: string;
}