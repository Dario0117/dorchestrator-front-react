import { render, screen } from '@testing-library/react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './table';

describe('Table', () => {
  describe('rendering', () => {
    it('renders a table element', () => {
      render(
        <Table data-testid="table">
          <TableBody>
            <TableRow>
              <TableCell>cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );
      expect(screen.getByTestId('table').tagName).toBe('TABLE');
    });

    it('renders with proper structure (thead, tbody, tr, th, td)', () => {
      render(
        <Table data-testid="table">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Alice</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );
      const table = screen.getByTestId('table');
      expect(table.querySelector('thead')).toBeInTheDocument();
      expect(table.querySelector('tbody')).toBeInTheDocument();
      expect(table.querySelector('tr')).toBeInTheDocument();
      expect(table.querySelector('th')).toBeInTheDocument();
      expect(table.querySelector('td')).toBeInTheDocument();
    });
  });

  describe('complete table', () => {
    it('renders all parts together', () => {
      render(
        <Table data-testid="full-table">
          <TableCaption>A list of users</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Alice</TableCell>
              <TableCell>alice@example.com</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Bob</TableCell>
              <TableCell>bob@example.com</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total</TableCell>
              <TableCell>2</TableCell>
            </TableRow>
          </TableFooter>
        </Table>,
      );
      const table = screen.getByTestId('full-table');
      expect(screen.getByText('A list of users')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(table.querySelector('tfoot')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the table element', () => {
      render(
        <Table
          data-testid="table"
          aria-label="users"
        >
          <TableBody>
            <TableRow>
              <TableCell>cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );
      expect(screen.getByTestId('table')).toHaveAttribute(
        'aria-label',
        'users',
      );
    });

    it('spreads additional props to child elements', () => {
      render(
        <Table>
          <TableHeader data-testid="header">
            <TableRow data-testid="row">
              <TableHead data-testid="head">col</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody data-testid="body">
            <TableRow>
              <TableCell data-testid="cell">val</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter data-testid="footer">
            <TableRow>
              <TableCell>foot</TableCell>
            </TableRow>
          </TableFooter>
          <TableCaption data-testid="caption">cap</TableCaption>
        </Table>,
      );
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('body')).toBeInTheDocument();
      expect(screen.getByTestId('row')).toBeInTheDocument();
      expect(screen.getByTestId('head')).toBeInTheDocument();
      expect(screen.getByTestId('cell')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByTestId('caption')).toBeInTheDocument();
    });
  });
});
