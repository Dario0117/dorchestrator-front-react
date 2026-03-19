import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@components/ui/pagination';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Pagination', () => {
  it('should render a nav element with pagination aria-label', () => {
    renderWithProviders(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink>1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(
      screen.getByRole('navigation', { name: 'pagination' }),
    ).toBeInTheDocument();
  });
});

describe('PaginationContent', () => {
  it('should render a list element', () => {
    renderWithProviders(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink>1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(screen.getByRole('list')).toBeInTheDocument();
  });
});

describe('PaginationItem', () => {
  it('should render a list item element', () => {
    renderWithProviders(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink>1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(screen.getByRole('listitem')).toBeInTheDocument();
  });
});

describe('PaginationLink', () => {
  it('should render a button', () => {
    renderWithProviders(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink>1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
  });

  it('should set aria-current=page when isActive', () => {
    renderWithProviders(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink isActive>1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(screen.getByRole('button', { name: '1' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('should not set aria-current when not active', () => {
    renderWithProviders(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink>1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(screen.getByRole('button', { name: '1' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('should call onClick handler', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    renderWithProviders(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink onClick={onClick}>1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    await user.click(screen.getByRole('button', { name: '1' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('PaginationPrevious', () => {
  it('should render with previous aria-label', () => {
    renderWithProviders(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(
      screen.getByRole('button', { name: 'Go to previous page' }),
    ).toBeInTheDocument();
  });

  it('should render Previous text', () => {
    renderWithProviders(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(screen.getByText('Previous')).toBeInTheDocument();
  });
});

describe('PaginationNext', () => {
  it('should render with next aria-label', () => {
    renderWithProviders(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationNext />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(
      screen.getByRole('button', { name: 'Go to next page' }),
    ).toBeInTheDocument();
  });

  it('should render Next text', () => {
    renderWithProviders(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationNext />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(screen.getByText('Next')).toBeInTheDocument();
  });
});

describe('PaginationEllipsis', () => {
  it('should render with aria-hidden', () => {
    const { container } = renderWithProviders(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    const ellipsis = container.querySelector('[aria-hidden]');
    expect(ellipsis).toBeInTheDocument();
  });

  it('should render "More pages" screen reader text', () => {
    renderWithProviders(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(screen.getByText('More pages')).toBeInTheDocument();
  });
});
