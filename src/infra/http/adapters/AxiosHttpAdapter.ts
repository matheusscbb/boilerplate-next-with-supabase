import Axios, {
  type AxiosInstance, type AxiosResponseHeaders, type RawAxiosResponseHeaders,
  type AxiosHeaders, type InternalAxiosRequestConfig,
} from 'axios';

import { warnDebugOnly } from '@/utils/debug';

import {
  type HttpAdapterInterceptorsType,
  type IHttpAdapter,
  type IRequestOptions,
  type IResponseError,
  type IResponseSuccess,
  type MethodsType,
} from '../IHttpAdapter';

const isAxiosHeaders = (axiosHeaders: RawAxiosResponseHeaders | AxiosResponseHeaders): axiosHeaders is AxiosHeaders => (
  typeof axiosHeaders.toJSON === 'function'
);

export const parseAxiosHeaders = (axiosHeaders?: RawAxiosResponseHeaders | AxiosResponseHeaders) => {
  if (!axiosHeaders) return {};

  if (isAxiosHeaders(axiosHeaders)) {
    return axiosHeaders.toJSON();
  }

  return axiosHeaders as {};
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

  private handleAxiosError<ErrorData>(
    error?: any,
  ): IResponseError<ErrorData, any> {
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
        headers: parseAxiosHeaders(error.response?.headers),
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
  ): Promise<IResponseError<ErrorData, any> | IResponseSuccess<SuccessData>> {
    try {
      const response = await this.axiosInstance.request({
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
        headers: parseAxiosHeaders(response.headers),
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
  ): Promise<IResponseError<ErrorData, any> | IResponseSuccess<SuccessData>> {
    return this.executeRequest('GET', url, undefined, options, abortController);
  }

  post<SuccessData, ErrorData = SuccessData, RequestBody = any>(
    url: string,
    body?: RequestBody,
    options?: IRequestOptions,
    abortController?: AbortController,
  ): Promise<IResponseError<ErrorData, any> | IResponseSuccess<SuccessData>> {
    return this.executeRequest('POST', url, body, options, abortController);
  }

  put<SuccessData, ErrorData = SuccessData, RequestBody = any>(
    url: string,
    body?: RequestBody,
    options?: IRequestOptions,
    abortController?: AbortController,
  ): Promise<IResponseError<ErrorData, any> | IResponseSuccess<SuccessData>> {
    return this.executeRequest('PUT', url, body, options, abortController);
  }

  patch<SuccessData, ErrorData = SuccessData, RequestBody = any>(
    url: string,
    body?: RequestBody,
    options?: IRequestOptions,
    abortController?: AbortController,
  ): Promise<IResponseError<ErrorData, any> | IResponseSuccess<SuccessData>> {
    return this.executeRequest('PATCH', url, body, options, abortController);
  }

  delete<SuccessData, ErrorData = SuccessData>(
    url: string,
    options?: IRequestOptions,
    abortController?: AbortController,
  ): Promise<IResponseError<ErrorData, any> | IResponseSuccess<SuccessData>> {
    return this.executeRequest('DELETE', url, undefined, options, abortController);
  }

}
