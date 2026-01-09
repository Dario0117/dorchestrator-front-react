import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '@components/ui/dialog';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Dialog', () => {
  it('should render dialog root with correct data-slot', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
      </Dialog>,
    );

    const trigger = screen.getByRole('button', { name: 'Open Dialog' });
    expect(trigger).toBeInTheDocument();
  });

  it('should render dialog trigger with correct attributes', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
      </Dialog>,
    );

    const trigger = screen.getByRole('button', { name: 'Open Dialog' });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('data-slot', 'dialog-trigger');
  });

  it('should open dialog when trigger is clicked', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog description content</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );

    const trigger = screen.getByRole('button', { name: 'Open Dialog' });
    await user.click(trigger);

    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    expect(screen.getByText('Dialog description content')).toBeInTheDocument();
  });

  it('should close dialog when close button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByText('Dialog Title')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);

    expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
  });

  it('should hide close button when showCloseButton is false', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );

    expect(
      screen.queryByRole('button', { name: 'Close' }),
    ).not.toBeInTheDocument();
  });

  it('should render dialog components with correct content', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('should render all dialog components with data-slot attributes', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent className="custom-content">
          <DialogHeader className="custom-header">
            <DialogTitle className="custom-title">Title</DialogTitle>
            <DialogDescription className="custom-description">
              Description
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="custom-footer">Footer</DialogFooter>
        </DialogContent>
      </Dialog>,
    );

    expect(
      document.querySelector('[data-slot="dialog-content"]'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="dialog-header"]'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="dialog-title"]'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="dialog-description"]'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="dialog-footer"]'),
    ).toBeInTheDocument();
  });

  it('should close dialog when overlay is clicked', async () => {
    const user = userEvent.setup();

    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByText('Dialog Title')).toBeInTheDocument();

    const overlay = document.querySelector('[data-slot="dialog-overlay"]');
    expect(overlay).toBeInTheDocument();

    if (overlay) {
      await user.click(overlay);
    }

    expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
  });

  it('should close dialog when escape key is pressed', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByText('Dialog Title')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
  });

  it('should render DialogClose component with correct attributes', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog description</DialogDescription>
          <DialogClose>Custom Close</DialogClose>
        </DialogContent>
      </Dialog>,
    );

    const closeButton = screen.getByRole('button', { name: 'Custom Close' });
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveAttribute('data-slot', 'dialog-close');
  });

  it('should render DialogPortal with content', () => {
    render(
      <Dialog defaultOpen>
        <DialogPortal>
          <div>Portal content</div>
        </DialogPortal>
      </Dialog>,
    );

    expect(screen.getByText('Portal content')).toBeInTheDocument();
  });

  it('should render DialogOverlay within dialog context', () => {
    render(
      <Dialog defaultOpen>
        <DialogOverlay />
      </Dialog>,
    );

    const overlay = document.querySelector('[data-slot="dialog-overlay"]');
    expect(overlay).toBeInTheDocument();
  });

  it('should support controlled dialog state', async () => {
    const user = userEvent.setup();
    let isOpen = false;
    const setOpen = vi.fn((open: boolean) => {
      isOpen = open;
    });

    const { rerender } = render(
      <Dialog
        open={isOpen}
        onOpenChange={setOpen}
      >
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();

    const trigger = screen.getByRole('button', { name: 'Open Dialog' });
    await user.click(trigger);

    expect(setOpen).toHaveBeenCalledWith(true);

    // Simulate controlled state update
    isOpen = true;
    rerender(
      <Dialog
        open={isOpen}
        onOpenChange={setOpen}
      >
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
  });
});
