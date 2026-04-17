import type { ErrorHandlerType } from './HttpService';
import type { ErrorIdentifierType } from './IHttpAdapter';

export type CommonHttpErrorsType = ErrorIdentifierType<
  'NOT_FOUND' | 'UNAUTHORIZED' | 'PERMISSION_DENIED'
>;

export const commonErrorHandler: ErrorHandlerType<CommonHttpErrorsType> = response => {
  if (response.status === 404) return 'NOT_FOUND';
  if (response.status === 401) return 'UNAUTHORIZED';
  if (response.status === 403) return 'PERMISSION_DENIED';
  return 'UNKNOWN';
};
