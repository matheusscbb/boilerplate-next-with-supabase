import Axios, { AxiosHeaders, type RawAxiosResponseHeaders } from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';
import {
  it, describe, beforeEach, expect,
  vi,
} from 'vitest';

import { delay } from '@/utils/promises';

import { isResponseError } from '../IHttpAdapter';
import { AxiosErrorImpl } from './AxiosErrorImpl';
import { AxiosHttpAdapter, parseAxiosHeaders } from './AxiosHttpAdapter';

const axiosInstance = Axios.create({
  baseURL: 'http://localhost',
});

const mock = new AxiosMockAdapter(axiosInstance);

beforeEach(() => {
  mock.reset();
});

describe('AxiosHttpAdapter', () => {
  it('should call get/delete params and headers', async () => {
    const adapter = new AxiosHttpAdapter(axiosInstance);

    const responseData = {
      status: 'success',
    };

    mock.onAny('/').reply(200, responseData);

    const testRequest = async (method: 'delete' | 'get') => {
      const response = await adapter[method]('/', {
        params: {
          nome: 'Douglas',
        },
        headers: {
          Authorization: 'token-123',
        },
      });

      expect(mock.history[method][0].params.nome).toBe('Douglas');
      expect(mock.history[method][0].headers?.Authorization).toBe('token-123');

      expect(response.data).toEqual(responseData);
      expect(response.status).toEqual(200);
    };

    await Promise.all([
      testRequest('get'),
      testRequest('delete'),
    ]);
  });

  it('should call post/put/patch params and headers', async () => {
    const adapter = new AxiosHttpAdapter(axiosInstance);

    const responseData = {
      status: 'success',
    };

    mock.onAny('/').reply(200, responseData);

    const testRequest = async (method: 'post' | 'put' | 'patch') => {
      const requestData = {
        foo: 'bar',
      };

      const response = await adapter[method](
        '/',
        requestData,
        {
          params: {
            nome: 'Douglas',
          },
          headers: {
            Authorization: 'token-123',
          },
        },
      );

      expect(mock.history[method][0].params.nome).toBe('Douglas');
      expect(mock.history[method][0].headers?.Authorization).toBe('token-123');
      expect(JSON.parse(mock.history[method][0].data)).toEqual(requestData);

      expect(response.data).toEqual(responseData);
      expect(response.status).toEqual(200);
    };

    await Promise.all([
      testRequest('post'),
      testRequest('put'),
      testRequest('patch'),
    ]);
  });

  it('should prevent global axios', () => {
    expect(() => {
      new AxiosHttpAdapter(Axios);
    }).toThrowError();
  });

  it('should handle js error', async () => {
    const adapter = new AxiosHttpAdapter(axiosInstance);

    mock.onAny('/').reply(() => {
      throw new Error('forced error');
    });

    const response = await adapter.get('/');

    const isError = isResponseError(response);

    expect(isError).toBeTruthy();

    if (isError) {
      expect(response.error).toBe('UNKNOWN');
    }
  });

  it('should handle axios error', async () => {
    const adapter = new AxiosHttpAdapter(axiosInstance);

    const responseData = {
      status: 'error',
    };

    mock.onAny('/').reply(404, responseData);

    const response = await adapter.get('/');

    expect(response.data).toEqual(responseData);

    const isError = isResponseError(response);

    expect(isError).toBeTruthy();

    if (isError) {
      expect(response.error).toBe('UNKNOWN');
    }
  });

  it('should handle custom axios error', async () => {
    const customAxiosInstance = Axios.create({
      baseURL: 'http://localhost',
    });

    const responseErrorData = {
      success: false,
    };

    const responseSuccessData = {
      success: true,
    };

    const customMock = new AxiosMockAdapter(customAxiosInstance);

    customMock.onAny('/success').reply(200, responseSuccessData);
    customMock.onAny('/error').reply(200, responseErrorData);

    customAxiosInstance.interceptors.response.use(response => {
      if (!response.data.success) {
        response.status = 400;
        throw new AxiosErrorImpl(response);
      }
      return response;
    }, error => Promise.reject(error));

    const adapter = new AxiosHttpAdapter(customAxiosInstance);

    const responseError = await adapter.get('/error');

    const isError = isResponseError(responseError);

    expect(isError).toBeTruthy();
    if (isError) {
      expect(responseError.error).toBe('UNKNOWN');
    }
    expect(responseError.data).toEqual(responseErrorData);
    expect(responseError.status).toBe(400);

    const responseSuccess = await adapter.get('/success');
    expect(responseSuccess.data).toEqual(responseSuccessData);
    expect(responseSuccess.status).toBe(200);
  });

  it('should parse RawAxiosResponseHeaders to object', () => {
    const axiosHeaders: RawAxiosResponseHeaders = {
      'Cache-Control': 'none',
      'Content-Encoding': 'utf-8',
      'Content-Length': '2000',
      'Content-Type': 'application/json',
      'set-cookie': ['bla bla'],
      'custom-header': 'custom-header-value',
    };

    expect(parseAxiosHeaders(axiosHeaders)).toEqual({
      'Cache-Control': 'none',
      'Content-Encoding': 'utf-8',
      'Content-Length': '2000',
      'Content-Type': 'application/json',
      'set-cookie': ['bla bla'],
      'custom-header': 'custom-header-value',
    });
  });

  it('should parse AxiosHeaders to object', () => {
    const axiosHeaders = new AxiosHeaders();

    axiosHeaders.setAccept('application/json');
    axiosHeaders.setAuthorization('Bearer token-123');
    axiosHeaders.set('custom-header', 'custom-header-value');

    expect(parseAxiosHeaders(axiosHeaders)).toEqual({
      Accept: 'application/json',
      Authorization: 'Bearer token-123',
      'custom-header': 'custom-header-value',
    });
  });

  it('should parse empty headers to object', () => {
    const axiosHeaders = undefined;

    expect(parseAxiosHeaders(axiosHeaders)).toEqual({ });
  });

  it('should use constructor options', async () => {
    const adapter = new AxiosHttpAdapter(axiosInstance, {
      baseURL: 'http://baseUrl',
      headerInterceptors: [
        () => ({
          headers: {
            key: 'value',
            Authorization: 'token-123',
          },
        }),
        () => undefined],
    });

    const responseData = {
      status: 'success',
    };

    mock.onAny('/').reply(200, responseData);

    await adapter.get('/');

    expect(mock.history.get[0].headers?.Authorization).toBe('token-123');
    expect(mock.history.get[0].headers?.key).toBe('value');

  });

  it('should cancel pending request', async () => {
    // Ativa o uso de fake timers para controlar o tempo de execução do setTimeout
    vi.useFakeTimers();
    const adapter = new AxiosHttpAdapter(axiosInstance);

    mock.onAny('/').reply(200, async () => {
      // Aguarda 1s para simular uma chamada assíncrona
      await delay(1000);
    });

    const abortController = new AbortController();

    // Inicia a requisição, mas não aguarda pela resposta
    const responsePromise = adapter.get('/', undefined, abortController);

    // Cancela a requisição antes que ela seja finalizada
    abortController.abort();

    // Aguarda a resposta da requisição
    const response = await responsePromise;

    // Avança o tempo para que o setTimeout seja executado mesmo após o cancelamento
    vi.runOnlyPendingTimers();
    // Desativa o uso de fake timers para retornar ao comportamento normal
    vi.useRealTimers();

    const isError = isResponseError(response);

    expect(isError).toBeTruthy();

    if (isError) {
      expect(response.error).toBe('CANCELLED');
    }
  });

});
