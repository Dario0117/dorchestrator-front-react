import { Input } from '@components/ui/input';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Input', () => {
  it('should render successfully', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('data-slot', 'input');
  });

  it('should render with different input types', () => {
    const { rerender } = render(<Input type="email" />);
    let input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');

    rerender(<Input type="password" />);
    input = document.querySelector(
      'input[type="password"]',
    ) as HTMLInputElement;
    expect(input).toHaveAttribute('type', 'password');

    rerender(<Input type="number" />);
    input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('type', 'number');
  });

  it('should handle value changes', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<Input onChange={handleChange} />);
    const input = screen.getByRole('textbox');

    await user.type(input, 'test value');
    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue('test value');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('should have proper placeholder text', () => {
    render(<Input placeholder="Type something here" />);
    const input = screen.getByPlaceholderText('Type something here');
    expect(input).toBeInTheDocument();
  });

  it('should forward all props correctly', () => {
    render(
      <Input
        id="test-input"
        name="testName"
        required
        maxLength={10}
        data-testid="test-input"
      />,
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'test-input');
    expect(input).toHaveAttribute('name', 'testName');
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('maxlength', '10');
    expect(input).toHaveAttribute('data-testid', 'test-input');
  });

  it('should handle focus correctly', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    input.focus();
    expect(input).toHaveFocus();
  });

  it('should support aria-invalid attribute', () => {
    render(<Input aria-invalid />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid');
  });

  it('should handle readonly attribute', () => {
    render(
      <Input
        readOnly
        value="readonly value"
      />,
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('readonly');
    expect(input).toHaveValue('readonly value');
  });

  it('should handle file input type', () => {
    render(
      <Input
        type="file"
        accept=".jpg,.png"
      />,
    );
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('accept', '.jpg,.png');
    expect(input).toHaveAttribute('data-slot', 'input');
  });

  it('should render as input element', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
  });
});
