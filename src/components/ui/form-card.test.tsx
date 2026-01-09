import { FormCard } from '@components/ui/form-card';
import { render, screen } from '@testing-library/react';

describe('FormCard', () => {
  it('should render successfully with title, description and children', () => {
    render(
      <FormCard
        title="Test Title"
        description="Test Description"
      >
        <div>Form content</div>
      </FormCard>,
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Form content')).toBeInTheDocument();
  });

  it('should render with proper card structure', () => {
    render(
      <FormCard
        title="Login"
        description="Enter your credentials"
      >
        <input
          type="text"
          placeholder="Username"
        />
      </FormCard>,
    );

    // Should contain card components
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Enter your credentials')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
  });

  it('should handle complex children content', () => {
    render(
      <FormCard
        title="Registration Form"
        description="Create a new account"
      >
        <form>
          <input
            type="email"
            placeholder="Email"
          />
          <input
            type="password"
            placeholder="Password"
          />
          <button type="submit">Register</button>
        </form>
      </FormCard>,
    );

    expect(screen.getByText('Registration Form')).toBeInTheDocument();
    expect(screen.getByText('Create a new account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Register' }),
    ).toBeInTheDocument();
  });

  it('should handle empty or minimal content', () => {
    render(
      <FormCard
        title=""
        description=""
      >
        <span>Minimal content</span>
      </FormCard>,
    );

    expect(screen.getByText('Minimal content')).toBeInTheDocument();
  });

  it('should render with long title and description', () => {
    const longTitle =
      'This is a very long title that might wrap to multiple lines in the card header';
    const longDescription =
      'This is a very long description that provides detailed information about what the user should do in this form and might also wrap to multiple lines.';

    render(
      <FormCard
        title={longTitle}
        description={longDescription}
      >
        <div>Content</div>
      </FormCard>,
    );

    expect(screen.getByText(longTitle)).toBeInTheDocument();
    expect(screen.getByText(longDescription)).toBeInTheDocument();
  });

  it('should render nested components properly', () => {
    render(
      <FormCard
        title="Nested Form"
        description="Form with nested elements"
      >
        <div className="form-section">
          <div className="field-group">
            <label htmlFor="nested-input">Nested Input</label>
            <input
              id="nested-input"
              type="text"
            />
          </div>
          <div className="button-group">
            <button type="button">Cancel</button>
            <button type="submit">Submit</button>
          </div>
        </div>
      </FormCard>,
    );

    expect(screen.getByText('Nested Form')).toBeInTheDocument();
    expect(screen.getByText('Form with nested elements')).toBeInTheDocument();
    expect(screen.getByText('Nested Input')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('should render wrapper structure correctly', () => {
    const { container } = render(
      <FormCard
        title="Test"
        description="Test description"
      >
        <div>Content</div>
      </FormCard>,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toBeInTheDocument();
    expect(wrapper.tagName).toBe('DIV');
  });
});
