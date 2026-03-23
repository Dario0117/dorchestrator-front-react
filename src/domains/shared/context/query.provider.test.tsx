import { QueryProvider } from '@domains/shared/context/query.provider';
import { render, screen } from '@testing-library/react';

describe('QueryProvider', () => {
  it('should render children within the provider', () => {
    render(
      <QueryProvider>
        <div>test content</div>
      </QueryProvider>,
    );

    expect(screen.getByText('test content')).toBeInTheDocument();
  });
});
