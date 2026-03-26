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
});
