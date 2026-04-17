import {
  describe, expect, it, vi,
} from 'vitest';

import { waitFor } from '@/utils/tests';

import i18n from '.';

vi.unmock('i18next');

i18n.addResourceBundle('pt', 'mockNs', {
  foo: 'bar',
});

describe('i18n', () => {
  it('should be able to initialized with pt', async () => {
    await waitFor(() => {
      expect(i18n.language).toBe('pt');
    });
  });

  it('should', async () => {
    expect(i18n.t('foo' as any, { ns: 'mockNs' as any })).toBe('bar');
  });
});
