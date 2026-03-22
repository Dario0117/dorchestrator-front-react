import { clickTrigger } from '@lib/test-wrappers.utils';
import { render, screen } from '@testing-library/react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog';

describe('AlertDialog', () => {
  describe('rendering', () => {
    it('renders trigger', () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>Delete</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Confirm</AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialog>,
      );
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('does not show content when closed', () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>Delete</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Confirm</AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialog>,
      );
      expect(screen.queryByText('Confirm')).not.toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('shows content when trigger is clicked', async () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>Delete</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>,
      );

      await clickTrigger(screen.getByText('Delete'));
      expect(screen.getByText('Are you sure?')).toBeInTheDocument();
      expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
    });
  });

  describe('portal and overlay', () => {
    it('renders content via AlertDialogPortal and AlertDialogOverlay', () => {
      render(
        <AlertDialog open={true}>
          <AlertDialogPortal>
            <AlertDialogOverlay />
            <AlertDialogContent>
              <AlertDialogTitle>Portal dialog</AlertDialogTitle>
            </AlertDialogContent>
          </AlertDialogPortal>
        </AlertDialog>,
      );

      expect(screen.getByText('Portal dialog')).toBeInTheDocument();
    });
  });

  describe('media', () => {
    it('renders AlertDialogMedia inside content', () => {
      render(
        <AlertDialog open={true}>
          <AlertDialogContent>
            <AlertDialogTitle>With media</AlertDialogTitle>
            <AlertDialogMedia data-testid="media">
              media content
            </AlertDialogMedia>
          </AlertDialogContent>
        </AlertDialog>,
      );

      expect(screen.getByTestId('media')).toBeInTheDocument();
      expect(screen.getByText('media content')).toBeInTheDocument();
    });
  });

  describe('semantic props', () => {
    it('accepts size on AlertDialogContent', async () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogTitle>Small dialog</AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialog>,
      );

      await clickTrigger(screen.getByText('Open'));
      expect(screen.getByText('Small dialog')).toBeInTheDocument();
    });

    it('accepts variant and size on AlertDialogCancel', async () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Title</AlertDialogTitle>
            <AlertDialogCancel
              variant="outline"
              size="default"
            >
              Cancel
            </AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>,
      );

      await clickTrigger(screen.getByText('Open'));
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });
});
