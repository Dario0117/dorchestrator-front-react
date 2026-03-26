// app-link.tsx only exports constants (APP_LINK_VARIANT) and a type.
// No React component to render or behavior to test.

import { APP_LINK_VARIANT } from '@components/ds/atoms/app-link';

describe('APP_LINK_VARIANT', () => {
  it('should export card and underline variants', () => {
    expect(APP_LINK_VARIANT).toHaveProperty('card');
    expect(APP_LINK_VARIANT).toHaveProperty('underline');
  });
});
