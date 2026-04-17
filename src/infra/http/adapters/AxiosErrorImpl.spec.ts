import Axios, { type AxiosResponse } from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';
import {
  it, describe, expect,
} from 'vitest';

import { AxiosErrorImpl } from './AxiosErrorImpl';

describe('AxiosErrorImpl', () => {

  it('should return object with toJSON', async () => {
    const customAxiosInstance = Axios.create({
      baseURL: 'http://localhost',
    });

    type RequestDataType = {
      name: string;
    };

    type ResponseDataType = {
      success: boolean;
      message: string;
    };

    const customMock = new AxiosMockAdapter(customAxiosInstance);
    customMock.onAny('/').reply(200, {
      success: true,
      message: 'welcome!',
    });

    const response = await customAxiosInstance.post<ResponseDataType, AxiosResponse<ResponseDataType, RequestDataType>, RequestDataType>('/', {
      name: 'Douglas',
    });

    expect(response.data).toEqual({
      success: true,
      message: 'welcome!',
    });

    const customError = new AxiosErrorImpl(response, 'ERROR_CODE');

    expect(customError.toJSON()).toEqual({
      config: response.config,
      code: 'ERROR_CODE',
      request: response.request,
      response,
    });
  });

});
