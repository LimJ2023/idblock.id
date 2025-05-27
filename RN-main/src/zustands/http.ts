import { create } from 'zustand';
import Axios, { AxiosError, AxiosInstance, AxiosRequestConfig, isAxiosError } from 'axios';

import { useAppRoot } from './app';

import { HTTP_METHOD, HTTP_RESULT_CODE } from '~/types/enum';
import { API_PREFIX, KEY_STORAGE } from '~/utils/constant';
import { useUser } from './user';
import Util from '~/utils/common';

let isLockedRefresh = false;

const axios: AxiosInstance = Axios.create({
  timeout: 7000,
  headers: { 'Cache-Control': 'no-cache' },
});

// 요청 인터셉터 추가
axios.interceptors.request.use(
  (config) => {
    console.log('🚀 Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.log('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 추가
axios.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.log('❌ Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

interface Store {
  baseUrl: string;
  signout: () => Promise<void>;
  getDefaultConfig: (header?: Object) => Promise<any>;
  retry: (method: HTTP_METHOD, url: string, params: any, config: AxiosRequestConfig<any>) => Promise<any>;
  errorCatcher: (
    method: HTTP_METHOD,
    url: string,
    params: any,
    config: AxiosRequestConfig<any>,
    error: unknown,
  ) => Promise<ThrowableResult>;
  get: (url: string, params?: Object, header?: Object, config?: AxiosRequestConfig<any>) => Promise<any>;
  post: (url: string, params?: Object, header?: Object, config?: AxiosRequestConfig<any>) => Promise<any>;
  postForm: (url: string, params?: any, header?: Object, config?: AxiosRequestConfig<any>) => Promise<any>;
  put: (url: string, params?: Object, header?: Object, config?: AxiosRequestConfig<any>) => Promise<any>;
  patch: (url: string, params?: Object, header?: Object, config?: AxiosRequestConfig<any>) => Promise<any>;
  del: (url: string, params?: Object, header?: Object, config?: AxiosRequestConfig<any>) => Promise<any>;
  setBaseUrl: (url: string) => void;
}

export const useHttp = create<Store>((setStore, getStore) => ({
  baseUrl: API_PREFIX,
  signout: async () => {
    await Util.set(KEY_STORAGE.ACCESS_TOKEN);
    await Util.set(KEY_STORAGE.REFRESH_TOKEN);

    const { setAccessToken, setRefreshToken } = useAppRoot.getState().action;
    const { setProfile } = useUser.getState().action;

    setAccessToken('');
    setRefreshToken('');
    setProfile({});
  },
  getDefaultConfig: async (header: any = null) => {
    const token = await Util.get(KEY_STORAGE.ACCESS_TOKEN);
    const config: any = {
      headers: {},
      data: null,
    };

    if (token) {
      config.headers.Authorization = 'Bearer ' + token;
    }

    if (header) {
      config.headers = Object.assign(config.headers, header);
    }

    return config;
  },
  retry: async (method: HTTP_METHOD, url: string, params: any, config: AxiosRequestConfig<any>) => {
    switch (method) {
      case HTTP_METHOD.GET:
        return await getStore().get(url, params, {}, config);
      case HTTP_METHOD.POST:
        return await getStore().post(url, params, {}, config);
      case HTTP_METHOD.PATCH:
        return await getStore().patch(url, params, {}, config);
      case HTTP_METHOD.PUT:
        return await getStore().put(url, params, {}, config);
      case HTTP_METHOD.DELETE:
        return await getStore().del(url, params, {}, config);
    }
  },
  errorCatcher: async (
    method: HTTP_METHOD,
    url: string,
    params: any,
    config: AxiosRequestConfig<any>,
    error: unknown,
  ): Promise<ThrowableResult> => {
    /*
     * API 호출 오류 처리
     */
    let accessToken = await Util.get(KEY_STORAGE.ACCESS_TOKEN);

    const result: ThrowableResult = {
      isThrowError: true,
      data: {},
    };

    if (isAxiosError(error)) {
      const errorData = error?.response?.data as any;

      console.log('ERROR zustands > http.ts >', `[${method}] ${getStore().baseUrl}${url}`, error.code, errorData);

      if (error?.code && [AxiosError.ECONNABORTED, AxiosError.ERR_NETWORK].includes(error.code)) {
        /*
         * 네트워크 연결 에러
         */
        return result;
      }

      if (errorData && accessToken) {
        const data = error.response.data as any;

        if ('refreshToken' in params) {
          /*
           * 리프래시 토큰 갱신 실패 처리
           */
          if (isLockedRefresh) {
            isLockedRefresh = false;
          }

          console.log('ERROR zustands > http.ts > EXPIRED REFRESH_TOKEN', error.response.data);

          getStore().signout();

          result.data = data;
        } else if (errorData.message === HTTP_RESULT_CODE.UNAUTHORIZED) {
          /*
           * 엑세스 토큰 만료 처리
           */
          if (isLockedRefresh) {
            /*
             * 다른 API에서 토큰 갱신 시도를 막기 위해 플래그 설정
             * 이미 토큰 갱신 시도가 있었으면 요청 API를 재호출하고 종료
             */
            await Util.sleep(1500);

            accessToken = await Util.get(KEY_STORAGE.ACCESS_TOKEN);

            result.isThrowError = false;

            if (accessToken) {
              result.data = await getStore().retry(method, url, params, config);
            } else {
              result.data = error.response.data;
            }

            return result;
          } else {
            isLockedRefresh = true;
          }

          const refreshToken = await Util.get(KEY_STORAGE.REFRESH_TOKEN);

          const response = await getStore().post('/v1/auth/refresh-token', {
            refreshToken,
          });

          if (isLockedRefresh) {
            isLockedRefresh = false;
          }

          if (response?.data?.accessToken) {
            /*
             * 토큰 갱신에 성공시 호출 하려던 API 재호출
             */
            await Util.set(KEY_STORAGE.ACCESS_TOKEN, response.data.accessToken);

            useAppRoot.getState().action.setAccessToken(response.data.accessToken);

            result.data = await getStore().retry(method, url, params, config);
            result.isThrowError = false;
          }
        } else {
          /*
           * 기타 인증과 상관없는 오류인 경우
           */
          result.isThrowError = false;
          result.data = data;

          console.log('HttpUtil > ', method, ' ...', `${getStore().baseUrl}${url}`, '> ', config, data, params);
        }
      } else {
        console.log('HttpUtil > ', method, ' ...', `${getStore().baseUrl}${url}`, config, params);

        result.isThrowError = false;
        result.data = error;
      }
    } else {
      console.log('IS NOT AXIOS ERROR', error);
    }

    return result;
  },
  get: async (url, params: any = {}, header: Object = {}, config: AxiosRequestConfig<any> = {}) => {
    const _config: AxiosRequestConfig<any> = {
      ...config,
      ...(await getStore().getDefaultConfig(header)),
    };
    let result;

    try {
      let query = '';

      if (params) {
        query = Util.objectToQueryString(params);
      }

      result = (await axios.get(`${getStore().baseUrl}${url}${query}`, _config)).data;
    } catch (error) {
      const catchedError = await getStore().errorCatcher(HTTP_METHOD.GET, url, params, config, error);

      if (catchedError.isThrowError) {
        throw error;
      }

      result = catchedError.data;
    }

    return result;
  },
  post: async (url, params: any = {}, header: Object = {}, config: AxiosRequestConfig<any> = {}) => {
    const _config: AxiosRequestConfig<any> = {
      ...config,
      ...(await getStore().getDefaultConfig(header)),
    };
    let result;

    try {
      result = (await axios.post(`${getStore().baseUrl}${url}`, params, _config)).data;
    } catch (error) {
      const catchedError = await getStore().errorCatcher(HTTP_METHOD.POST, url, params, config, error);

      if (catchedError.isThrowError) {
        throw error;
      }

      result = catchedError.data;
    }

    return result;
  },
  postForm: async (url, params = {}, header: Object = {}, config: AxiosRequestConfig<any> = {}) => {
    const _config: AxiosRequestConfig<any> = {
      ...config,
      ...(await getStore().getDefaultConfig({
        ...header,
        'Content-Type': 'multipart/form-data',
      })),
      transformRequest: (_params) => _params,
    };

    let result;

    try {
      result = (await axios.post(`${getStore().baseUrl}${url}`, params, _config)).data;
    } catch (error) {
      const catchedError = await getStore().errorCatcher(HTTP_METHOD.POST, url, params, config, error);

      if (catchedError.isThrowError) {
        throw error;
      }

      result = catchedError.data;
    }

    return result;
  },
  put: async (url, params = {}, header: Object = {}, config: AxiosRequestConfig<any> = {}) => {
    const _config: AxiosRequestConfig<any> = {
      ...config,
      ...(await getStore().getDefaultConfig(header)),
    };
    let result;

    try {
      result = (await axios.put(`${getStore().baseUrl}${url}`, params, _config)).data;
    } catch (error) {
      const catchedError = await getStore().errorCatcher(HTTP_METHOD.PUT, url, params, config, error);

      if (catchedError.isThrowError) {
        throw error;
      }

      result = catchedError.data;
    }

    return result;
  },
  patch: async (url, params = {}, header: Object = {}, config: AxiosRequestConfig<any> = {}) => {
    const _config: AxiosRequestConfig<any> = {
      ...config,
      ...(await getStore().getDefaultConfig(header)),
    };
    let result;

    try {
      result = (await axios.patch(`${getStore().baseUrl}${url}`, params, _config)).data;
    } catch (error) {
      const catchedError = await getStore().errorCatcher(HTTP_METHOD.PATCH, url, params, config, error);

      if (catchedError.isThrowError) {
        throw error;
      }

      result = catchedError.data;
    }

    return result;
  },
  del: async (url, params: any = {}, header: Object = {}, config: AxiosRequestConfig<any> = {}) => {
    const _config: AxiosRequestConfig<any> = {
      ...config,
      ...(await getStore().getDefaultConfig(header)),
    };

    let result;

    try {
      _config.data = params;

      result = (await axios.delete(`${getStore().baseUrl}${url}`, _config)).data;
    } catch (error) {
      const catchedError = await getStore().errorCatcher(HTTP_METHOD.DELETE, url, params, config, error);

      if (catchedError.isThrowError) {
        throw error;
      }

      result = catchedError.data;
    }

    return result;
  },
  setBaseUrl: (baseUrl) => {
    setStore(() => ({
      baseUrl,
    }));
  },
}));

interface ThrowableResult {
  isThrowError: boolean;
  data: any;
}

export const useSetBaseUrl = () => useHttp((state) => ({ setBaseUrl: state.setBaseUrl }));
