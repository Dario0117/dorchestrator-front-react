import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@components/ds/molecules/sheet';
import { clickTrigger } from '@lib/test-wrappers.utils';
import { render, screen } from '@testing-library/react';

describe('Sheet', () => {
  it('renders trigger and opens content on click', async () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Title</SheetTitle>
            <SheetDescription>Description</SheetDescription>
          </SheetHeader>
          <div>Body</div>
          <SheetFooter>
            <SheetClose>Close</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>,
    );

    expect(screen.getByText('Open')).toBeInTheDocument();

    await clickTrigger(screen.getByText('Open'));

    expect(await screen.findByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });
});

describe('SheetContent', () => {
  it('passes through the side prop', async () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Left sheet</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );

    await clickTrigger(screen.getByText('Open'));

    const content = await screen.findByText('Left sheet');
    const sheetContent = content.closest('[data-slot="sheet-content"]');
    expect(sheetContent).toHaveAttribute('data-side', 'left');
  });

  it('hides close button when showCloseButton is false', async () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent showCloseButton={false}>
          <SheetHeader>
            <SheetTitle>No close</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );

    await clickTrigger(screen.getByText('Open'));

    await screen.findByText('No close');

    const closeButtons = document.querySelectorAll(
      '[data-slot="sheet-content"] [data-slot="sheet-close"]',
    );
    expect(closeButtons).toHaveLength(0);
  });
});
