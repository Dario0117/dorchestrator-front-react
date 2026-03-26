import { CodeBlock } from '@components/ds/atoms/code-block';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

describe('CodeBlock', () => {
  it('renders children text', () => {
    renderWithProviders(<CodeBlock>console.log('hello')</CodeBlock>);
    expect(screen.getByText("console.log('hello')")).toBeInTheDocument();
  });

  it('renders as a pre element', () => {
    renderWithProviders(<CodeBlock>some code</CodeBlock>);
    expect(screen.getByText('some code').tagName).toBe('PRE');
  });
});
