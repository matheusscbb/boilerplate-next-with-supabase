import {
  type IHttpAdapter,
  type IRequestOptions,
  type IResponseError,
  type IResponseSuccess,
  type MethodsType,
} from '../IHttpAdapter';

export type MockSuccessDataType = {
  status: 'success';
};

export type MockErrorDataType = {
  status: 'error';
};

type FakeResponseType =
IResponseError<any, any> |
IResponseSuccess<any> |
Promise<IResponseError<any, any> |
IResponseSuccess<any>>;

type FakeRequestFunctionType = (
  method: MethodsType,
  url: string,
  body?: any,
  options?: IRequestOptions,
) => FakeResponseType;

export type FakeResponsesType = {
  [key: string]: IResponseError<any, any> | IResponseSuccess<any> | FakeRequestFunctionType;
};

export const FAKE_RESPONSES = {
  '/success/200': {
    data: {
      status: 'success',
    },
    headers: {},
    status: 200,
    url: '/success/200',
  },
  '/error/404': {
    data: {
      status: 'error',
    },
    headers: {},
    status: 404,
    url: '/error/404',
    error: 'UNKNOWN',
  },
  '/error/401': {
    data: {
      status: 'error',
    },
    headers: {},
    status: 401,
    url: '/error/401',
    error: 'UNKNOWN',
  },
  '/error/500': {
    data: {
      status: 'error',
    },
    headers: {},
    status: 500,
    url: '/error/500',
    error: 'UNKNOWN',
  },
  '/error/network': {
    url: '/error/network',
    error: 'UNKNOWN',
  },
  '/error/unknown': {
    data: {
      status: 'error',
    },
    headers: {},
    status: 499,
    url: '/error/unknown',
    error: 'UNKNOWN',
  },
} satisfies FakeResponsesType;

export class MockHttpAdapter implements IHttpAdapter {

  private fakeResponses: FakeResponsesType;

  constructor(fakeResponses?: FakeResponsesType) {
    this.fakeResponses = fakeResponses ?? FAKE_RESPONSES;
  }

  private async executeRequest(
    method: MethodsType,
    url: string,
    body?: any,
    options?: IRequestOptions,
    abortController?: AbortController,
  ): Promise<IResponseError<any, any> | IResponseSuccess<any>> {
    const request = this.fakeResponses[url] || Promise.resolve(FAKE_RESPONSES['/error/404']);

    let response: IResponseError<any, any> | IResponseSuccess<any>;

    if (typeof request === 'function') {
      response = await this.executeWithAbortController(
        request(method, url, body, options),
        abortController,
      );
    } else {
      response = request;
    }

    return response;
  }

  /**
   * Simula a execução de uma requisição com um AbortController para possibilitar
   * o cancelamento da requisição.
   *
   * Controla a corrida entre a execução da requisição e o cancelamento da mesma para
   * que impedir que a promise seja resolvida em duplicidade.
   *
   * @param responsePromise
   * @param abortController
   * @returns
   */
  private executeWithAbortController(
    responsePromise: FakeResponseType,
    abortController?: AbortController,
  ): IResponseError<any, any> | IResponseSuccess<any> | PromiseLike<IResponseError<any, any> | IResponseSuccess<any>> {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
    return new Promise(async resolve => {
      let resolved = false;
      abortController?.signal.addEventListener('abort', () => {
        if (resolved) return;
        resolved = true;
        resolve({
          error: 'CANCELLED',
        });
      });
      const res = await responsePromise;
      if (resolved) return;
      resolved = true;
      resolve(res);
    });
  }

  public updateFakeResponses(fakeResponses: FakeResponsesType) {
    this.fakeResponses = {
      ...this.fakeResponses,
      ...fakeResponses,
    };
  }

  public setFakeResponses(fakeResponses: FakeResponsesType) {
    this.fakeResponses = fakeResponses;
  }

  async get<SuccessData = MockSuccessDataType, ErrorData = MockErrorDataType>(
    url: string,
    options?: IRequestOptions,
    abortController?: AbortController,
  ): Promise<IResponseError<ErrorData, any> | IResponseSuccess<SuccessData>> {
    return this.executeRequest('GET', url, undefined, options, abortController);
  }

  async post<SuccessData = MockSuccessDataType, ErrorData = MockErrorDataType, RequestBody = any>(
    url: string,
    body?: RequestBody,
    options?: IRequestOptions,
    abortController?: AbortController,
  ): Promise<IResponseError<ErrorData, any> | IResponseSuccess<SuccessData>> {
    return this.executeRequest('POST', url, body, options, abortController);
  }

  async put<SuccessData = MockSuccessDataType, ErrorData = MockErrorDataType, RequestBody = any>(
    url: string,
    body?: RequestBody,
    options?: IRequestOptions,
    abortController?: AbortController,
  ): Promise<IResponseError<ErrorData, any> | IResponseSuccess<SuccessData>> {
    return this.executeRequest('PUT', url, body, options, abortController);
  }

  async patch<SuccessData = MockSuccessDataType, ErrorData = MockErrorDataType, RequestBody = any>(
    url: string,
    body?: RequestBody,
    options?: IRequestOptions,
    abortController?: AbortController,
  ): Promise<IResponseError<ErrorData, any> | IResponseSuccess<SuccessData>> {
    return this.executeRequest('PATCH', url, body, options, abortController);
  }

  async delete<SuccessData = MockSuccessDataType, ErrorData = MockErrorDataType>(
    url: string,
    options?: IRequestOptions,
    abortController?: AbortController,
  ): Promise<IResponseError<ErrorData, any> | IResponseSuccess<SuccessData>> {
    return this.executeRequest('DELETE', url, undefined, options, abortController);
  }

}
