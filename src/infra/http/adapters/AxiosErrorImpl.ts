import { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

export class AxiosErrorImpl<ResponseData = any, RequestData = any>
  extends Error
  implements AxiosError<ResponseData, RequestData> {

  config: InternalAxiosRequestConfig<RequestData>;

  code?: string;

  request?: any;

  response?: AxiosResponse<ResponseData, RequestData>;

  isAxiosError = true;

  toJSON: () => object;

  constructor(response: AxiosResponse<ResponseData, RequestData>, code?: string) {
    super('Custom axios error');
    this.response = response;
    this.request = response.request;
    this.config = response.config;
    this.code = code;
    this.toJSON = () => ({
      config: this.config,
      code: this.code,
      request: this.request,
      response: this.response,
    });
  }

}
