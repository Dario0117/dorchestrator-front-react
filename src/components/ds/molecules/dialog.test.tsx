import { clickTrigger } from '@lib/test-wrappers.utils';
import { render, screen } from '@testing-library/react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from './dialog';

describe('Dialog', () => {
  describe('rendering', () => {
    it('renders trigger', () => {
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
      expect(screen.getByText('Open')).toBeInTheDocument();
    });

    it('does not show content when closed', () => {
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );
      expect(screen.queryByText('Title')).not.toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('shows content when trigger is clicked', async () => {
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      );

      await clickTrigger(screen.getByText('Open'));
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    });

    it('renders DialogDescription inside content', async () => {
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Some description</DialogDescription>
          </DialogContent>
        </Dialog>,
      );

      await clickTrigger(screen.getByText('Open'));
      expect(screen.getByText('Some description')).toBeInTheDocument();
    });
  });

  describe('semantic props', () => {
    it('accepts showCloseButton on DialogContent', async () => {
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent showCloseButton={false}>
            <DialogTitle>No close button</DialogTitle>
          </DialogContent>
        </Dialog>,
      );

      await clickTrigger(screen.getByText('Open'));
      expect(screen.getByText('No close button')).toBeInTheDocument();
      expect(screen.queryByText('Close')).not.toBeInTheDocument();
    });
  });

  describe('DialogPortal', () => {
    it('renders children through a portal', () => {
      render(
        <Dialog open>
          <DialogPortal>
            <DialogOverlay />
            <DialogContent>
              <DialogTitle>Portal content</DialogTitle>
            </DialogContent>
          </DialogPortal>
        </Dialog>,
      );
      expect(screen.getByText('Portal content')).toBeInTheDocument();
    });
  });

  describe('DialogClose', () => {
    it('renders a close button inside an open dialog', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogClose>Dismiss</DialogClose>
          </DialogContent>
        </Dialog>,
      );
      expect(screen.getByText('Dismiss')).toBeInTheDocument();
    });
  });

  describe('DialogOverlay', () => {
    it('renders the overlay inside a portal', () => {
      render(
        <Dialog open>
          <DialogPortal>
            <DialogOverlay data-testid="dialog-overlay" />
            <DialogContent>
              <DialogTitle>Title</DialogTitle>
            </DialogContent>
          </DialogPortal>
        </Dialog>,
      );
      expect(screen.getByTestId('dialog-overlay')).toBeInTheDocument();
    });
  });
});
