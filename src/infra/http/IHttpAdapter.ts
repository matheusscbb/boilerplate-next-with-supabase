export interface IResponseSuccess<T> {
  data: T;
  status: number;
  headers: {
    [key: string]: string;
  };
  url: string;
}

export type MethodsType = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export type ErrorIdentifierType<ErrorType extends string> = ErrorType
| 'CANCELLED'
| 'SERVER'
| 'NETWORK'
| 'UNKNOWN'
| 'INVALID_CREDENTIALS';

export function isResponseError<SuccessData, ErrorData, ErrorType extends string>(
  response: IResponseSuccess<SuccessData> | IResponseError<ErrorData, ErrorType>,
): response is IResponseError<ErrorData, ErrorType> {
  return 'error' in response;
}

export interface IResponseError<ErrorData, ErrorType extends string>
  extends Partial<IResponseSuccess<ErrorData>> {
  error: ErrorIdentifierType<ErrorType>;
}

export interface IRequestOptions {
  headers?: {
    [key: string]: string | number | boolean;
  };
  params?: {
    [key: string]: any;
  };
}

type InterceptorResultType = {
  headers: Record<string, string>;
};

export type HttpAdapterInterceptorsType =
() => InterceptorResultType | undefined | Promise<InterceptorResultType | undefined>;

export interface IHttpAdapter {

  get<SuccessData, ErrorData = SuccessData>(
    url: string,
    options?: IRequestOptions,
    abortController?: AbortController,
  ): Promise<IResponseSuccess<SuccessData> | IResponseError<ErrorData, any>>;

  post<SuccessData, ErrorData = SuccessData, RequestBody = any>(
    url: string,
    body?: RequestBody,
    options?: IRequestOptions,
    abortController?: AbortController,
  ): Promise<IResponseSuccess<SuccessData> | IResponseError<ErrorData, any>>;

  put<SuccessData, ErrorData = SuccessData, RequestBody = any>(
    url: string,
    body?: RequestBody,
    options?: IRequestOptions,
    abortController?: AbortController,
  ): Promise<IResponseSuccess<SuccessData> | IResponseError<ErrorData, any>>;

  patch<SuccessData, ErrorData = SuccessData, RequestBody = any>(
    url: string,
    body?: RequestBody,
    options?: IRequestOptions,
    abortController?: AbortController,
  ): Promise<IResponseSuccess<SuccessData> | IResponseError<ErrorData, any>>;

  delete<SuccessData, ErrorData = SuccessData>(
    url: string,
    options?: IRequestOptions,
    abortController?: AbortController,
  ): Promise<IResponseSuccess<SuccessData> | IResponseError<ErrorData, any>>;

}
