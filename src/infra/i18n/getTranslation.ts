import type { KeysWithReturnObjects } from 'i18next';

import i18n from '.';

function getTranslation<NS extends keyof KeysWithReturnObjects = keyof KeysWithReturnObjects>(ns?: NS | NS[]) {
  const t = (key: KeysWithReturnObjects[NS], params?: Record<string, {}>) => (
    i18n.t(key as any, { ...params, ns } as any) as string
  );

  return {
    t,
  };
}

export default getTranslation;
