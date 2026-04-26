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
    [key: string]: unknown;
  };
}

type InterceptorResultType = {
  headers: Record<string, string>;
};

export type HttpAdapterInterceptorsType =
() => InterceptorResultType | undefined | Promise<InterceptorResultType | undefined>;

/**
 * Adapter-level errors only ever contain the platform-defined base codes.
 * Service-specific codes are added later by `HttpService`, so we use
 * `never` here as the "no extra codes" sentinel — keeping the result
 * assignable to any `IResponseError<ErrorData, MyErrorType>`.
 */
export type AdapterResponse<SuccessData, ErrorData = SuccessData> =
  | IResponseSuccess<SuccessData>
  | IResponseError<ErrorData, never>;

export interface IHttpAdapter {

  get<SuccessData, ErrorData = SuccessData>(
    url: string,
    options?: IRequestOptions,
    abortController?: AbortController,
  ): Promise<AdapterResponse<SuccessData, ErrorData>>;

  post<SuccessData, ErrorData = SuccessData, RequestBody = unknown>(
    url: string,
    body?: RequestBody,
    options?: IRequestOptions,
    abortController?: AbortController,
  ): Promise<AdapterResponse<SuccessData, ErrorData>>;

  put<SuccessData, ErrorData = SuccessData, RequestBody = unknown>(
    url: string,
    body?: RequestBody,
    options?: IRequestOptions,
    abortController?: AbortController,
  ): Promise<AdapterResponse<SuccessData, ErrorData>>;

  patch<SuccessData, ErrorData = SuccessData, RequestBody = unknown>(
    url: string,
    body?: RequestBody,
    options?: IRequestOptions,
    abortController?: AbortController,
  ): Promise<AdapterResponse<SuccessData, ErrorData>>;

  delete<SuccessData, ErrorData = SuccessData>(
    url: string,
    options?: IRequestOptions,
    abortController?: AbortController,
  ): Promise<AdapterResponse<SuccessData, ErrorData>>;

}
