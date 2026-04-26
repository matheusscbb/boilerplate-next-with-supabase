import type { KeysWithReturnObjects, TOptions } from 'i18next';

import i18n from '.';

/**
 * Tiny convenience around `i18n.t` that pre-binds a namespace (or list of
 * them) so consuming components don't have to repeat `{ ns: 'foo' }` on
 * every call. Returns `{ t }` for ergonomic destructuring.
 */
function getTranslation<NS extends keyof KeysWithReturnObjects = keyof KeysWithReturnObjects>(ns?: NS | NS[]) {
  const t = (key: KeysWithReturnObjects[NS], params?: TOptions) => (
    i18n.t(key as string, { ...params, ns } as TOptions) as string
  );

  return {
    t,
  };
}

export default getTranslation;
