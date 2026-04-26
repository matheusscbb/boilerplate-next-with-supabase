import { } from '@testing-library/react';
import {
  it, describe, expect,
  vitest,
} from 'vitest';

import { isResponseError, type IResponseSuccess } from '../IHttpAdapter';
import {
  FAKE_RESPONSES,
  type FakeAnyResponse,
  type FakeRequestFunctionType,
  MockHttpAdapter,
} from './MockHttpAdapter';

describe('MockHttpAdapter', () => {
  it('all methods', async () => {
    const adapter = new MockHttpAdapter();

    const responses = await Promise.all([
      adapter.get('/success/200'),
      adapter.post('/success/200'),
      adapter.patch('/success/200'),
      adapter.put('/success/200'),
      adapter.delete('/success/200'),
    ]);

    responses.forEach(response => {
      expect(response).toEqual(FAKE_RESPONSES['/success/200']);
    });
  });

  it('erros', async () => {
    const adapter = new MockHttpAdapter();

    const expectedResponses = [
      '/error/401',
      '/error/404',
      '/error/500',
      '/error/network',
      '/error/unknown',
    ];

    const responses = await Promise.all(expectedResponses.map(url => adapter.get(url)));

    expect(responses).toEqual(expectedResponses.map(url => FAKE_RESPONSES[url as keyof typeof FAKE_RESPONSES]));

    expect(
      responses
        .filter(isResponseError)
        .map(response => response.error),
    ).toEqual([
      'UNKNOWN',
      'UNKNOWN',
      'UNKNOWN',
      'UNKNOWN',
      'UNKNOWN',
    ]);
  });

  it('not found', async () => {
    const adapter = new MockHttpAdapter();

    const response = await adapter.get('/foo/bar');

    expect(response).toEqual(FAKE_RESPONSES['/error/404']);
  });

  it('update responses', async () => {
    const adapter = new MockHttpAdapter();

    let response = await adapter.get('/foo/bar');

    expect(response).toEqual(FAKE_RESPONSES['/error/404']);

    adapter.updateFakeResponses({
      '/foo/bar': {
        data: {
          status: 'success',
        },
        headers: {},
        status: 200,
        url: '/foo/bar',
      },
    });

    response = await adapter.get('/foo/bar');

    expect(response).toEqual({
      data: {
        status: 'success',
      },
      headers: {},
      status: 200,
      url: '/foo/bar',
    });
  });

  it('set responses', async () => {
    const adapter = new MockHttpAdapter();

    let response = await adapter.get('/foo/bar');

    expect(response).toEqual(FAKE_RESPONSES['/error/404']);

    adapter.setFakeResponses({
      '/foo/bar': {
        data: {
          status: 'success',
        },
        headers: {},
        status: 200,
        url: '/foo/bar',
      },
    });

    response = await adapter.get('/foo/bar');

    expect(response).toEqual({
      data: {
        status: 'success',
      },
      headers: {},
      status: 200,
      url: '/foo/bar',
    });
  });

  it('functional responses', async () => {
    const adapter = new MockHttpAdapter({
      '/foo/bar': () => ({
        data: {
          status: 'success',
        },
        headers: {},
        status: 200,
        url: '/foo/bar',
      }),
    });

    const response = await adapter.get('/foo/bar');

    expect(response).toEqual({
      data: {
        status: 'success',
      },
      headers: {},
      status: 200,
      url: '/foo/bar',
    });
  });

  it('mock functional responses', async () => {
    const adapter = new MockHttpAdapter({
      '/foo/bar': vitest.fn<FakeRequestFunctionType>().mockReturnValue({
        data: {
          status: 'success',
        },
        headers: {},
        status: 200,
        url: '/foo/bar',
      }),
    });

    const response = await adapter.get('/foo/bar');

    expect(response).toEqual({
      data: {
        status: 'success',
      },
      headers: {},
      status: 200,
      url: '/foo/bar',
    });
  });

  it('should cancel request', async () => {
    let resolvePromise: ((value: FakeAnyResponse) => void) | undefined;
    const adapter = new MockHttpAdapter({
      '/success/200': () => new Promise<FakeAnyResponse>(resolve => {
        resolvePromise = resolve;
      }),
    });

    const abortController = new AbortController();
    const responsePromise = adapter.get('/success/200', undefined, abortController);

    abortController.abort();

    resolvePromise?.(FAKE_RESPONSES['/success/200'] as IResponseSuccess<unknown>);

    const response = await responsePromise;

    const isError = isResponseError(response);

    expect(isError).toBe(true);

    if (isError) {
      expect(response.error).toBe('CANCELLED');
    }
  });

  it('should ignore cancel if request was resolved', async () => {
    let resolvePromise: ((value: FakeAnyResponse) => void) | undefined;
    const adapter = new MockHttpAdapter({
      '/success/200': () => new Promise<FakeAnyResponse>(resolve => {
        resolvePromise = resolve;
      }),
    });

    const abortController = new AbortController();
    const responsePromise = adapter.get('/success/200', undefined, abortController);

    // Resolve a requisição antes de chamar o abort
    resolvePromise?.(FAKE_RESPONSES['/success/200'] as IResponseSuccess<unknown>);

    await new Promise(resolve => {
      // Simula uma situação assíncrona para chamar o abort após a resolução da requisição ser chamada
      setTimeout(() => {
        abortController.abort();
        resolve(undefined);
      });
    });

    const response = await responsePromise;

    const isError = isResponseError(response);

    expect(isError).toBe(false);
    expect(response).toEqual(FAKE_RESPONSES['/success/200']);
  });

});
