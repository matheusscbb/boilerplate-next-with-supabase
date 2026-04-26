import {
  it, describe, expect,
} from 'vitest';

import {
  FAKE_RESPONSES, type FakeResponsesType, type MockErrorDataType, MockHttpAdapter, type MockSuccessDataType,
} from './adapters/MockHttpAdapter';
import { type ErrorHandlerType, HttpService, type ResponseInterceptorType } from './HttpService';
import {
  type ErrorIdentifierType, isResponseError,
} from './IHttpAdapter';

type MockErrorType = ErrorIdentifierType<
'GLOBAL_MOCK_ERROR'
| 'LOCAL_MOCK_ERROR'
| 'ERROR_GENERATED_BY_LOCAL_INTERCEPTOR'
| 'ERROR_GENERATED_BY_GLOBAL_INTERCEPTOR'
>;

const globalErrorHandler: ErrorHandlerType<MockErrorType> = response => {
  if (response.data?.status === 'error') {
    return 'GLOBAL_MOCK_ERROR';
  }

  return 'UNKNOWN';
};

class MockService extends HttpService<MockErrorType> {

  constructor(
    fakeResponses?: FakeResponsesType,
    errorHandler?: ErrorHandlerType<MockErrorType>,
    responseInterceptor?: ResponseInterceptorType<unknown, unknown, MockErrorType>,
  ) {
    super(new MockHttpAdapter(fakeResponses), errorHandler, responseInterceptor);
  }

  serviceGetCustom(errorHandler?: ErrorHandlerType<MockErrorType, MockErrorDataType>) {
    return this.get<MockSuccessDataType, MockErrorDataType>('/custom', undefined, errorHandler);
  }

  serviceGetSuccess() {
    return this.get<MockSuccessDataType, MockErrorDataType>('/success/200', undefined);
  }

  serviceGetLocalError() {
    return this.get<MockSuccessDataType, MockErrorDataType>('/error/404', undefined, response => {
      if (response.data?.status === 'error') {
        return 'LOCAL_MOCK_ERROR';
      }

      return 'UNKNOWN';
    });
  }

  serviceGetGlobalError() {
    return this.get<MockSuccessDataType, MockErrorDataType>('/error/404', undefined);
  }

  servicePostSuccess() {
    return this.post<MockSuccessDataType, MockErrorDataType>('/success/200');
  }

  servicePutSuccess() {
    return this.put<MockSuccessDataType, MockErrorDataType>('/success/200');
  }

  servicePatchSuccess() {
    return this.patch<MockSuccessDataType, MockErrorDataType>('/success/200');
  }

  serviceDeleteSuccess() {
    return this.delete<MockSuccessDataType, MockErrorDataType>('/success/200');
  }

  serviceWithResponseInterceptor() {
    return this.get<MockSuccessDataType, MockErrorDataType>(
      '/error/200',
      undefined,
      undefined,
      response => Promise.resolve({
        error: 'ERROR_GENERATED_BY_LOCAL_INTERCEPTOR',
        data: {
          status: 'error',
        },
        headers: response.headers,
        status: response.status,
        url: response.url,
      }),
    );
  }

}

describe('HttpService', () => {
  it('all methods', async () => {
    const service = new MockService();

    const responses = await Promise.all([
      service.serviceGetSuccess(),
      service.servicePostSuccess(),
      service.servicePutSuccess(),
      service.servicePatchSuccess(),
      service.serviceDeleteSuccess(),
    ]);

    responses.forEach(response => {
      expect(response).toEqual(FAKE_RESPONSES['/success/200']);
    });
  });

  it('global error handler', async () => {
    const service = new MockService(undefined, globalErrorHandler);

    const response = await service.serviceGetGlobalError();

    const isError = isResponseError(response);

    expect(isError).toBeTruthy();

    if (isError) {
      expect(response.error).toEqual('GLOBAL_MOCK_ERROR');
    }
  });

  it('local error handler', async () => {
    const service = new MockService(undefined, globalErrorHandler);

    const response = await service.serviceGetLocalError();

    const isError = isResponseError(response);

    expect(isError).toBeTruthy();

    if (isError) {
      expect(response.error).toEqual('LOCAL_MOCK_ERROR');
    }
  });

  it('unknown error', async () => {
    const service = new MockService();

    const response = await service.serviceGetGlobalError();

    const isError = isResponseError(response);

    expect(isError).toBeTruthy();

    if (isError) {
      expect(response.error).toEqual('UNKNOWN');
    }
  });

  it('should return network error', async () => {
    const service = new MockService({
      '/custom': {
        error: 'UNKNOWN',
        status: undefined,
      },
    });

    const response = await service.serviceGetCustom();

    const isError = isResponseError(response);

    expect(isError).toBeTruthy();

    if (isError) {
      expect(response.error).toEqual('NETWORK');
    }
  });

  it('should return invalid credentials error', async () => {
    const service = new MockService({
      '/custom': {
        error: 'UNKNOWN',
        status: 401,
      },
    });

    const response = await service.serviceGetCustom();

    const isError = isResponseError(response);

    expect(isError).toBeTruthy();

    if (isError) {
      expect(response.error).toEqual('INVALID_CREDENTIALS');
    }
  });

  it('should return server error', async () => {
    const service = new MockService({
      '/custom': {
        error: 'UNKNOWN',
        status: 500,
      },
    });

    const response = await service.serviceGetCustom();

    const isError = isResponseError(response);

    expect(isError).toBeTruthy();

    if (isError) {
      expect(response.error).toEqual('SERVER');
    }
  });

  it('should priorize custom error handler over the static error inside http service', async () => {
    const service = new MockService({
      '/custom': {
        error: 'UNKNOWN',
        status: 401,
      },
    });

    const response = await service.serviceGetCustom(responseError => {
      if (responseError.status === 401) {
        return 'LOCAL_MOCK_ERROR';
      }
      return 'UNKNOWN';
    });

    const isError = isResponseError(response);

    expect(isError).toBeTruthy();

    if (isError) {
      expect(response.error).toEqual('LOCAL_MOCK_ERROR');
    }
  });

  it('should handle local response interceptor to convert success to error', async () => {
    const service = new MockService({
      '/error/200': {
        url: '/error/200',
        data: {
          status: 'success',
        },
        headers: {},
        status: 200,
      },
    });

    const response = await service.serviceWithResponseInterceptor();

    const isError = isResponseError(response);

    expect(isError).toBeTruthy();

    if (isError) {
      expect(response.error).toEqual('ERROR_GENERATED_BY_LOCAL_INTERCEPTOR');
    }
  });

  it('should handle global response interceptor to convert success to error', async () => {
    const service = new MockService(
      {
        '/success/200': {
          url: '/success/200',
          data: {
            status: 'success',
          },
          headers: {},
          status: 200,
        },
      },
      undefined,
      response => Promise.resolve({
        error: 'ERROR_GENERATED_BY_GLOBAL_INTERCEPTOR',
        data: {
          status: 'error',
        },
        headers: response.headers,
        status: response.status,
        url: response.url,
      }),
    );

    const response = await service.serviceGetSuccess();

    const isError = isResponseError(response);

    expect(isError).toBeTruthy();

    if (isError) {
      expect(response.error).toEqual('ERROR_GENERATED_BY_GLOBAL_INTERCEPTOR');
    }
  });

});
