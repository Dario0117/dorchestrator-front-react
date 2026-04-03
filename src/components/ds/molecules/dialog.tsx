import {
  Dialog as ShadcnDialog,
  DialogClose as ShadcnDialogClose,
  DialogContent as ShadcnDialogContent,
  DialogDescription as ShadcnDialogDescription,
  DialogFooter as ShadcnDialogFooter,
  DialogHeader as ShadcnDialogHeader,
  DialogOverlay as ShadcnDialogOverlay,
  DialogPortal as ShadcnDialogPortal,
  DialogTitle as ShadcnDialogTitle,
  DialogTrigger as ShadcnDialogTrigger,
} from '@components/ui/dialog';
import { cn } from '@lib/utils';

type ShadcnDialogProps = React.ComponentProps<typeof ShadcnDialog>;
interface DialogProps extends ShadcnDialogProps {}

type ShadcnDialogTriggerProps = React.ComponentProps<
  typeof ShadcnDialogTrigger
>;
interface DialogTriggerProps extends ShadcnDialogTriggerProps {}

type ShadcnDialogPortalProps = React.ComponentProps<typeof ShadcnDialogPortal>;
interface DialogPortalProps extends ShadcnDialogPortalProps {}

type ShadcnDialogCloseProps = React.ComponentProps<typeof ShadcnDialogClose>;
interface DialogCloseProps extends ShadcnDialogCloseProps {}

type ShadcnDialogOverlayProps = React.ComponentProps<
  typeof ShadcnDialogOverlay
>;
interface DialogOverlayProps extends ShadcnDialogOverlayProps {}

type ShadcnDialogContentProps = React.ComponentProps<
  typeof ShadcnDialogContent
>;
type DialogContentSize = 'default' | 'wide' | 'narrow';
interface DialogContentProps
  extends Omit<ShadcnDialogContentProps, 'className' | 'style'> {
  size?: DialogContentSize;
}

type ShadcnDialogHeaderProps = React.ComponentProps<typeof ShadcnDialogHeader>;
interface DialogHeaderProps extends ShadcnDialogHeaderProps {}

type ShadcnDialogFooterProps = React.ComponentProps<typeof ShadcnDialogFooter>;
interface DialogFooterProps
  extends Omit<ShadcnDialogFooterProps, 'className' | 'style'> {
  spaceAbove?: 'md';
}

type ShadcnDialogTitleProps = React.ComponentProps<typeof ShadcnDialogTitle>;
interface DialogTitleProps extends ShadcnDialogTitleProps {}

type ShadcnDialogDescriptionProps = React.ComponentProps<
  typeof ShadcnDialogDescription
>;
interface DialogDescriptionProps extends ShadcnDialogDescriptionProps {}

function Dialog(props: DialogProps) {
  return <ShadcnDialog {...props} />;
}

function DialogTrigger(props: DialogTriggerProps) {
  return <ShadcnDialogTrigger {...props} />;
}

function DialogPortal(props: DialogPortalProps) {
  return <ShadcnDialogPortal {...props} />;
}

function DialogClose(props: DialogCloseProps) {
  return <ShadcnDialogClose {...props} />;
}

function DialogOverlay(props: DialogOverlayProps) {
  return <ShadcnDialogOverlay {...props} />;
}

function DialogContent({ size = 'default', ...props }: DialogContentProps) {
  return (
    <ShadcnDialogContent
      className={cn(
        size === 'default' && 'sm:max-w-lg',
        size === 'wide' && 'max-w-3xl',
        size === 'narrow' && 'sm:max-w-sm',
      )}
      {...props}
    />
  );
}

function DialogHeader(props: DialogHeaderProps) {
  return <ShadcnDialogHeader {...props} />;
}

function DialogFooter({ spaceAbove, ...props }: DialogFooterProps) {
  return (
    <ShadcnDialogFooter
      className={cn('sm:justify-between', spaceAbove === 'md' && 'mt-4')}
      {...props}
    />
  );
}

function DialogTitle(props: DialogTitleProps) {
  return <ShadcnDialogTitle {...props} />;
}

function DialogDescription(props: DialogDescriptionProps) {
  return <ShadcnDialogDescription {...props} />;
}

export {
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
};
