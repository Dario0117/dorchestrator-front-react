import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { MetadataLabel } from './metadata-label';

describe('MetadataLabel', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(
        <dl>
          <MetadataLabel>Name</MetadataLabel>
        </dl>,
      );
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    it('renders as a dt element', () => {
      render(
        <dl>
          <MetadataLabel>Name</MetadataLabel>
        </dl>,
      );
      expect(screen.getByText('Name').tagName).toBe('DT');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to the dt element', () => {
      const ref = createRef<HTMLElement>();
      render(
        <dl>
          <MetadataLabel ref={ref}>Name</MetadataLabel>
        </dl>,
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
      expect(ref.current?.tagName).toBe('DT');
    });
  });

  describe('additional props', () => {
    it('spreads additional props to the element', () => {
      render(
        <dl>
          <MetadataLabel data-testid="label">Name</MetadataLabel>
        </dl>,
      );
      expect(screen.getByTestId('label')).toBeInTheDocument();
    });
  });
});
