// Textarea is a pure pass-through wrapper around shadcn's Textarea.
// No custom logic, props, or behavior. The underlying shadcn component
// is tested by shadcn itself. Our ds/ wrappers that compose Textarea
// are tested separately.

import { Textarea } from '@components/ds/atoms/textarea';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('Textarea', () => {
  it('should render a textarea element', () => {
    renderWithProviders(<Textarea aria-label="test" />);
    expect(screen.getByRole('textbox', { name: 'test' })).toBeInTheDocument();
  });
});
