import { DefinitionValue } from '@components/ds/atoms/definition-value';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('DefinitionValue', () => {
  it('renders content', () => {
    renderWithProviders(
      <dl>
        <DefinitionValue>Some value</DefinitionValue>
      </dl>,
    );
    expect(screen.getByText('Some value')).toBeInTheDocument();
  });

  it('renders as a dd element', () => {
    const { container } = renderWithProviders(
      <dl>
        <DefinitionValue>Value</DefinitionValue>
      </dl>,
    );
    expect(container.querySelector('dd')).toBeInTheDocument();
  });

  describe('mono', () => {
    it('applies font-mono when mono is true', () => {
      const { container } = renderWithProviders(
        <dl>
          <DefinitionValue mono>monospace value</DefinitionValue>
        </dl>,
      );
      expect(container.querySelector('dd')).toHaveClass('font-mono');
    });

    it('does not apply font-mono by default', () => {
      const { container } = renderWithProviders(
        <dl>
          <DefinitionValue>normal value</DefinitionValue>
        </dl>,
      );
      expect(container.querySelector('dd')).not.toHaveClass('font-mono');
    });
  });

  it('spreads additional props', () => {
    renderWithProviders(
      <dl>
        <DefinitionValue data-testid="dv">Value</DefinitionValue>
      </dl>,
    );
    expect(screen.getByTestId('dv')).toBeInTheDocument();
  });
});
