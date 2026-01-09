import { Label } from '@components/ui/label';
import { render, screen } from '@testing-library/react';

describe('Label', () => {
  it('should render successfully', () => {
    render(<Label>Test Label</Label>);
    const label = screen.getByText('Test Label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('data-slot', 'label');
  });

  it('should render with custom className', () => {
    render(<Label className="custom-label">Label</Label>);
    const label = screen.getByText('Label');
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe('LABEL');
  });

  it('should render as label element', () => {
    render(<Label>Label</Label>);
    const label = screen.getByText('Label');
    expect(label.tagName).toBe('LABEL');
    expect(label).toHaveAttribute('data-slot', 'label');
  });

  it('should forward all props correctly', () => {
    render(
      <Label
        htmlFor="input-id"
        id="label-id"
        data-testid="test-label"
      >
        Input Label
      </Label>,
    );
    const label = screen.getByText('Input Label');
    expect(label).toHaveAttribute('for', 'input-id');
    expect(label).toHaveAttribute('id', 'label-id');
    expect(label).toHaveAttribute('data-testid', 'test-label');
  });

  it('should work with form inputs', () => {
    render(
      <div>
        <Label htmlFor="email">Email Address</Label>
        <input
          id="email"
          type="email"
        />
      </div>,
    );

    const label = screen.getByText('Email Address');
    const input = screen.getByRole('textbox');

    expect(label).toHaveAttribute('for', 'email');
    expect(input).toHaveAttribute('id', 'email');
  });

  it('should render within disabled group', () => {
    render(
      <div
        className="group"
        data-disabled="true"
      >
        <Label>Disabled Label</Label>
      </div>,
    );
    const label = screen.getByText('Disabled Label');
    expect(label).toBeInTheDocument();
    expect(label.parentElement).toHaveAttribute('data-disabled', 'true');
  });

  it('should render children correctly', () => {
    render(
      <Label>
        <span>Icon</span>
        Label Text
      </Label>,
    );

    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Label Text')).toBeInTheDocument();
  });

  it('should handle complex content', () => {
    render(
      <Label>
        Required Field
        <span className="text-destructive">*</span>
      </Label>,
    );

    expect(screen.getByText('Required Field')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});
