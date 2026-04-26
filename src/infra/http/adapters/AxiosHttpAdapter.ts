import Axios, {
  type AxiosInstance, type AxiosResponseHeaders, type RawAxiosResponseHeaders,
  type AxiosHeaders, type InternalAxiosRequestConfig,
} from 'axios';

import { warnDebugOnly } from '@/utils/debug';

import {
  type AdapterResponse,
  type HttpAdapterInterceptorsType,
  type IHttpAdapter,
  type IRequestOptions,
  type IResponseError,
  type MethodsType,
} from '../IHttpAdapter';

const isAxiosHeaders = (axiosHeaders: RawAxiosResponseHeaders | AxiosResponseHeaders): axiosHeaders is AxiosHeaders => (
  typeof axiosHeaders.toJSON === 'function'
);

export const parseAxiosHeaders = (
  axiosHeaders?: RawAxiosResponseHeaders | AxiosResponseHeaders,
): Record<string, unknown> => {
  if (!axiosHeaders) return {};

  if (isAxiosHeaders(axiosHeaders)) {
    return axiosHeaders.toJSON();
  }

  return axiosHeaders as Record<string, unknown>;
};

type AxiosHttpAdapterOptionsType = {
  baseURL: string;
  headerInterceptors?: HttpAdapterInterceptorsType[];
};

export class AxiosHttpAdapter implements IHttpAdapter {

  private readonly axiosInstance: AxiosInstance;

  constructor(axiosInstance: AxiosInstance, options?: AxiosHttpAdapterOptionsType) {
    if (axiosInstance === Axios) {
      throw new Error('Crie uma instância customizada do Axios para o ser ApiService. Use `Axios.create(...)`.');
    }
    this.axiosInstance = axiosInstance;

    options?.headerInterceptors?.forEach(interceptor => {
      this.axiosInstance.interceptors.request.use(async (requestConfig: InternalAxiosRequestConfig) => {
        const result = await interceptor();
        if (result?.headers) {
          requestConfig.headers.set(requestConfig.headers.concat(result?.headers));
        }
        return requestConfig;
      });
    });

    if (options?.baseURL) {
      this.axiosInstance.defaults.baseURL = options?.baseURL;
    }
  }

  // axios catches throw `unknown`-shaped objects (could be Error, AxiosError,
  // CanceledError, etc.). We narrow with the static type guards Axios ships.
  private handleAxiosError<ErrorData>(
    error?: unknown,
  ): IResponseError<ErrorData, never> {
    warnDebugOnly(error);

    if (Axios.isCancel(error)) {
      return {
        error: 'CANCELLED',
      };
    }

    if (Axios.isAxiosError(error)) {
      warnDebugOnly(error.response);
      return {
        data: error.response?.data,
        status: error.response?.status,
        headers: parseAxiosHeaders(error.response?.headers) as Record<string, string>,
        url: error.response?.config?.url,
        error: 'UNKNOWN',
      };
    }

    return {
      error: 'UNKNOWN',
    };
  }

  private async executeRequest<SuccessData, ErrorData, RequestBody>(
    method: MethodsType,
    url: string,
    body?: RequestBody,
    options?: IRequestOptions,
    abortController?: AbortController,
  ): Promise<AdapterResponse<SuccessData, ErrorData>> {
    try {
      const response = await this.axiosInstance.request<SuccessData>({
        url,
        method,
        data: body,
        params: options?.params,
        headers: options?.headers,
        signal: abortController?.signal,
      });

      return {
        data: response.data,
        status: response.status,
        headers: parseAxiosHeaders(response.headers) as Record<string, string>,
        url: response.config.url!,
      };
    } catch (error) {
      return this.handleAxiosError<ErrorData>(error);
    }
  }

  get<SuccessData, ErrorData = SuccessData>(
    url: string,
    options?: IRequestOptions,
    abortController?: AbortController,
  ): Promise<AdapterResponse<SuccessData, ErrorData>> {
    return this.executeRequest('GET', url, undefined, options, abortController);
  }

  post<SuccessData, ErrorData = SuccessData, RequestBody = unknown>(
    url: string,
    body?: RequestBody,
    options?: IRequestOptions,
    abortController?: AbortController,
  ): Promise<AdapterResponse<SuccessData, ErrorData>> {
    return this.executeRequest('POST', url, body, options, abortController);
  }

  put<SuccessData, ErrorData = SuccessData, RequestBody = unknown>(
    url: string,
    body?: RequestBody,
    options?: IRequestOptions,
    abortController?: AbortController,
  ): Promise<AdapterResponse<SuccessData, ErrorData>> {
    return this.executeRequest('PUT', url, body, options, abortController);
  }

  patch<SuccessData, ErrorData = SuccessData, RequestBody = unknown>(
    url: string,
    body?: RequestBody,
    options?: IRequestOptions,
    abortController?: AbortController,
  ): Promise<AdapterResponse<SuccessData, ErrorData>> {
    return this.executeRequest('PATCH', url, body, options, abortController);
  }

  delete<SuccessData, ErrorData = SuccessData>(
    url: string,
    options?: IRequestOptions,
    abortController?: AbortController,
  ): Promise<AdapterResponse<SuccessData, ErrorData>> {
    return this.executeRequest('DELETE', url, undefined, options, abortController);
  }

}
