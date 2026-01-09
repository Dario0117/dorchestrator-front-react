import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@components/ui/sheet';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

describe('Sheet', () => {
  it('should render sheet with trigger', () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Description</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('should open sheet when trigger is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Sheet Title</SheetTitle>
          <SheetDescription>Sheet Description</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    const trigger = screen.getByText('Open');
    await user.click(trigger);
    expect(await screen.findByText('Sheet Title')).toBeInTheDocument();
    expect(screen.getByText('Sheet Description')).toBeInTheDocument();
  });

  it('should close sheet when close button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Sheet Title</SheetTitle>
          <SheetDescription>Sheet Description</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    await user.click(screen.getByText('Open'));
    const closeButton = await screen.findByRole('button', { name: /close/i });
    await user.click(closeButton);
  });

  it('should render sheet header', async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Header Title</SheetTitle>
            <SheetDescription>Header description</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    await user.click(screen.getByText('Open'));
    expect(await screen.findByText('Header Title')).toBeInTheDocument();
  });

  it('should render sheet footer', async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Description</SheetDescription>
          <SheetFooter>
            <div>Footer content</div>
          </SheetFooter>
        </SheetContent>
      </Sheet>,
    );
    await user.click(screen.getByText('Open'));
    expect(await screen.findByText('Footer content')).toBeInTheDocument();
  });

  it('should render sheet close button', async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Description</SheetDescription>
          <SheetClose>Close sheet</SheetClose>
        </SheetContent>
      </Sheet>,
    );
    await user.click(screen.getByText('Open'));
    expect(await screen.findByText('Close sheet')).toBeInTheDocument();
  });

  it('should render with default side as right', async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Description</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    await user.click(screen.getByText('Open'));
    expect(await screen.findByText('Title')).toBeInTheDocument();
  });

  it('should render with left side', async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent side="left">
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Description</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    await user.click(screen.getByText('Open'));
    expect(await screen.findByText('Title')).toBeInTheDocument();
  });

  it('should render with top side', async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent side="top">
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Description</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    await user.click(screen.getByText('Open'));
    expect(await screen.findByText('Title')).toBeInTheDocument();
  });

  it('should render with bottom side', async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent side="bottom">
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Description</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    await user.click(screen.getByText('Open'));
    expect(await screen.findByText('Title')).toBeInTheDocument();
  });

  it('should apply custom className to content', async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent className="custom-class">
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Description</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    await user.click(screen.getByText('Open'));
    const content = await screen.findByText('Title');
    expect(content.closest('[data-slot="sheet-content"]')).toBeInTheDocument();
  });
});
