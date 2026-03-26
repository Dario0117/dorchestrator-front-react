import { Well } from '@components/ds/atoms/well';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('Well', () => {
  it('renders children', () => {
    renderWithProviders(<Well>Well content</Well>);
    expect(screen.getByText('Well content')).toBeInTheDocument();
  });
});
