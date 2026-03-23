import { StatusDot } from '@components/ds/atoms/status-dot';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('StatusDot', () => {
  it('should render with aria-label', () => {
    renderWithProviders(
      <StatusDot
        status="online"
        aria-label="Online"
      />,
    );
    expect(screen.getByLabelText('Online')).toBeInTheDocument();
  });

  it('should render with role img', () => {
    renderWithProviders(
      <StatusDot
        status="offline"
        aria-label="Offline"
      />,
    );
    expect(screen.getByRole('img', { name: 'Offline' })).toBeInTheDocument();
  });

  it('should render with default status when not specified', () => {
    renderWithProviders(<StatusDot aria-label="Status" />);
    expect(screen.getByRole('img', { name: 'Status' })).toBeInTheDocument();
  });
});
