import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import { IconCircle } from './icon-circle';

describe('IconCircle', () => {
  it('renders children', () => {
    renderWithProviders(<IconCircle>Icon</IconCircle>);
    expect(screen.getByText('Icon')).toBeInTheDocument();
  });

  it('renders child elements', () => {
    renderWithProviders(
      <IconCircle>
        <span data-testid="icon">X</span>
      </IconCircle>,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
