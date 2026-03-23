import { RestoringView } from '@domains/terminal/components/restoring-view';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('RestoringView', () => {
  it('should render restoring title', () => {
    renderWithProviders(<RestoringView />);
    expect(screen.getByText('Restoring recording...')).toBeInTheDocument();
  });

  it('should render restoring description', () => {
    renderWithProviders(<RestoringView />);
    expect(screen.getByText(/restored from cold storage/)).toBeInTheDocument();
  });
});
