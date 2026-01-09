import { ConfirmDialog } from '@components/confirm-dialog';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

describe('ConfirmDialog', () => {
  const mockHandleConfirm = vi.fn();
  const mockOnOpenChange = vi.fn();

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    title: 'Test Title',
    desc: 'Test description',
    handleConfirm: mockHandleConfirm,
  };

  it('should render dialog with title and description', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.desc)).toBeInTheDocument();
  });

  it('should render default button texts', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Continue')).toBeInTheDocument();
  });

  it('should render custom button texts', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        cancelBtnText="No"
        confirmText="Yes"
      />,
    );
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('should call handleConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...defaultProps} />);
    await user.click(screen.getByText('Continue'));
    expect(mockHandleConfirm).toHaveBeenCalledTimes(1);
  });

  it('should render confirm button as destructive variant', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        destructive={true}
      />,
    );
    const confirmButton = screen.getByText('Continue');
    expect(confirmButton).toBeInTheDocument();
  });

  it('should disable buttons when isLoading is true', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        isLoading={true}
      />,
    );
    expect(screen.getByText('Cancel')).toBeDisabled();
    expect(screen.getByText('Continue')).toBeDisabled();
  });

  it('should disable confirm button when disabled is true', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        disabled={true}
      />,
    );
    expect(screen.getByText('Continue')).toBeDisabled();
  });

  it('should render children when provided', () => {
    render(
      <ConfirmDialog {...defaultProps}>
        <div>Custom content</div>
      </ConfirmDialog>,
    );
    expect(screen.getByText('Custom content')).toBeInTheDocument();
  });

  it('should render JSX element as description', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        desc={<span>JSX description</span>}
      />,
    );
    expect(screen.getByText('JSX description')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        className="custom-class"
      />,
    );
    const customElement = document.querySelector('.custom-class');
    expect(customElement).not.toBeNull();
  });
});
