import {
  type ErrorIdentifierType,
  type IHttpAdapter,
  type IRequestOptions,
  type IResponseError,
  type IResponseSuccess,
  isResponseError,
} from './IHttpAdapter';

export type ErrorHandlerType<ErrorType extends string, ResponseData = any> = (
  response: IResponseError<ResponseData, ErrorType>
) => ErrorIdentifierType<ErrorType>;

export type ResponseInterceptorType<SuccessData, ErrorData = SuccessData, ErrorType extends string = 'UNKNOWN'> =
(
  response: IResponseSuccess<SuccessData> | IResponseError<ErrorData, ErrorType>
) => HttpResponseType<SuccessData, ErrorData, ErrorType>;

type HttpResponseType<SuccessData, ErrorData, ErrorType extends string = 'UNKNOWN'> =
IResponseSuccess<SuccessData> |
IResponseError<ErrorData, ErrorType> |
Promise<IResponseSuccess<SuccessData> | IResponseError<ErrorData, ErrorType>>;

export abstract class HttpService<ErrorType extends string = 'UNKNOWN'> {

  private readonly apiAdapter: IHttpAdapter;

  private readonly errorHandler?: ErrorHandlerType<ErrorType, any>;

  private readonly responseInterceptor?: ResponseInterceptorType<any, any, ErrorType>;

  constructor(
    apiAdapter: IHttpAdapter,
    errorHandler?: ErrorHandlerType<ErrorType, any>,
    responseInterceptor?: ResponseInterceptorType<any, any, ErrorType>,
  ) {
    this.apiAdapter = apiAdapter;
    this.errorHandler = errorHandler;
    this.responseInterceptor = responseInterceptor;
  }

  private async requestHandler<SuccessData, ErrorData = SuccessData>(
    request: HttpResponseType<SuccessData, ErrorData, ErrorType>,
    errorHandler?: ErrorHandlerType<ErrorType, ErrorData>,
    responseInterceptor?: ResponseInterceptorType<SuccessData, ErrorData, ErrorType>,
  ): Promise<IResponseSuccess<SuccessData> | IResponseError<ErrorData, ErrorType>> {
    let response = await request;

    if (responseInterceptor) {
      response = await responseInterceptor(response);
    } else if (this.responseInterceptor) {
      response = await this.responseInterceptor(response);
    }

    if (!isResponseError(response)) {
      return response;
    }

    let { error } = response;

    if (error === 'UNKNOWN' && errorHandler) {
      error = errorHandler(response);
    }

    if (error === 'UNKNOWN' && this.errorHandler) {
      error = this.errorHandler(response);
    }

    if (error === 'UNKNOWN') {
      error = this.handleErrorByStatus(response.status);
    }

    return {
      ...response,
      error,
    };
  }

  private handleErrorByStatus(
    statusCode?: number | null,
  ): ErrorIdentifierType<ErrorType> {
    if (!statusCode) {
      /**
       * Erros de rede, como por exemplo, quando o usuário está offline ou o servidor caiu.
       */
      return 'NETWORK';
    }

    if (statusCode === 401) {
      /**
       * Erros autorização ou autenticação, seja por token, usuário ou senha inválidos.
       */
      return 'INVALID_CREDENTIALS';
    }

    if (statusCode >= 500) {
      /**
       * Erros de servidor, onde o status é 500 ou superior
       */
      return 'SERVER';
    }

    return 'UNKNOWN';
  }

  protected get<SuccessData, ErrorData = SuccessData>(
    url: string,
    options?: IRequestOptions,
    errorHandler?: ErrorHandlerType<ErrorType, ErrorData>,
    responseInterceptor?: ResponseInterceptorType<SuccessData, ErrorData, ErrorType>,
    abortController?: AbortController,
  ): HttpResponseType<SuccessData, ErrorData, ErrorType> {
    return this.requestHandler(
      this.apiAdapter.get(url, options, abortController),
      errorHandler,
      responseInterceptor,
    );
  }

  protected post<SuccessData, ErrorData = SuccessData, RequestBody = any>(
    url: string,
    body?: RequestBody,
    options?: IRequestOptions,
    errorHandler?: ErrorHandlerType<ErrorType, ErrorData>,
    responseInterceptor?: ResponseInterceptorType<SuccessData, ErrorData, ErrorType>,
    abortController?: AbortController,
  ): HttpResponseType<SuccessData, ErrorData, ErrorType> {
    return this.requestHandler(
      this.apiAdapter.post(url, body, options, abortController),
      errorHandler,
      responseInterceptor,
    );
  }

  protected put<SuccessData, ErrorData = SuccessData, RequestBody = any>(
    url: string,
    body?: RequestBody,
    options?: IRequestOptions,
    errorHandler?: ErrorHandlerType<ErrorType, ErrorData>,
    responseInterceptor?: ResponseInterceptorType<SuccessData, ErrorData, ErrorType>,
    abortController?: AbortController,
  ): HttpResponseType<SuccessData, ErrorData, ErrorType> {
    return this.requestHandler(
      this.apiAdapter.put(url, body, options, abortController),
      errorHandler,
      responseInterceptor,
    );
  }

  protected patch<SuccessData, ErrorData = SuccessData, RequestBody = any>(
    url: string,
    body?: RequestBody,
    options?: IRequestOptions,
    errorHandler?: ErrorHandlerType<ErrorType, ErrorData>,
    responseInterceptor?: ResponseInterceptorType<SuccessData, ErrorData, ErrorType>,
    abortController?: AbortController,
  ): HttpResponseType<SuccessData, ErrorData, ErrorType> {
    return this.requestHandler(
      this.apiAdapter.patch(url, body, options, abortController),
      errorHandler,
      responseInterceptor,
    );
  }

  protected delete<SuccessData, ErrorData = SuccessData>(
    url: string,
    options?: IRequestOptions,
    errorHandler?: ErrorHandlerType<ErrorType, ErrorData>,
    responseInterceptor?: ResponseInterceptorType<SuccessData, ErrorData, ErrorType>,
    abortController?: AbortController,
  ): HttpResponseType<SuccessData, ErrorData, ErrorType> {
    return this.requestHandler(
      this.apiAdapter.delete(url, options, abortController),
      errorHandler,
      responseInterceptor,
    );
  }

}
