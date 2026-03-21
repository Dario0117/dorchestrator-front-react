import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { StatusDot } from './status-dot';

describe('StatusDot', () => {
  describe('rendering', () => {
    it('renders with role="img" and aria-label', () => {
      render(
        <StatusDot
          status="online"
          aria-label="Device online"
        />,
      );
      const dot = screen.getByRole('img', { name: 'Device online' });
      expect(dot).toBeInTheDocument();
    });

    it('renders as a span element', () => {
      render(
        <StatusDot
          status="online"
          aria-label="Device online"
        />,
      );
      const dot = screen.getByRole('img');
      expect(dot.tagName).toBe('SPAN');
    });

    it.each([
      'online',
      'offline',
      'running',
      'active',
      'pending',
      'success',
      'completed',
      'failed',
      'error',
    ] as const)('renders without error for status=%s', (status) => {
      render(
        <StatusDot
          status={status}
          aria-label={`Status: ${status}`}
        />,
      );
      expect(
        screen.getByRole('img', { name: `Status: ${status}` }),
      ).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('always renders aria-label', () => {
      render(
        <StatusDot
          status="online"
          aria-label="Device online"
        />,
      );
      const dot = screen.getByRole('img');
      expect(dot).toHaveAttribute('aria-label', 'Device online');
    });

    it('has role="img"', () => {
      render(
        <StatusDot
          status="online"
          aria-label="Device online"
        />,
      );
      expect(screen.getByRole('img')).toBeInTheDocument();
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to the span element', () => {
      const ref = createRef<HTMLSpanElement>();
      render(
        <StatusDot
          ref={ref}
          status="online"
          aria-label="Device online"
        />,
      );
      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(
        <StatusDot
          status="online"
          aria-label="Device online"
          data-testid="my-dot"
        />,
      );
      expect(screen.getByTestId('my-dot')).toBeInTheDocument();
    });
  });
});
