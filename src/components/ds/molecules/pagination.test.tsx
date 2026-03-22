import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@components/ds/molecules/pagination';
import { render, screen } from '@testing-library/react';

describe('Pagination', () => {
  it('renders as a nav element with pagination aria-label', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="/1">1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(screen.getByRole('navigation')).toHaveAttribute(
      'aria-label',
      'pagination',
    );
  });
});

describe('PaginationLink', () => {
  it('renders with isActive state', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink
              href="/1"
              isActive
            >
              1
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    const link = screen.getByText('1');
    expect(link).toHaveAttribute('aria-current', 'page');
  });

  it('renders without active state by default', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="/2">2</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    const link = screen.getByText('2');
    expect(link).not.toHaveAttribute('aria-current');
  });

  it('renders as disabled when disabled prop is passed', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink
              href="/1"
              disabled
            >
              1
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });
});

describe('PaginationPrevious', () => {
  it('renders with default text', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="/prev" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to previous page')).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="/prev"
              text="Back"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(screen.getByText('Back')).toBeInTheDocument();
  });
});

describe('PaginationNext', () => {
  it('renders with default text', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationNext href="/next" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to next page')).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationNext
              href="/next"
              text="Forward"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(screen.getByText('Forward')).toBeInTheDocument();
  });
});

describe('PaginationEllipsis', () => {
  it('renders with sr-only text', () => {
    render(
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
