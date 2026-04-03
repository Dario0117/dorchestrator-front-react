import {
  AlertDialog as ShadcnAlertDialog,
  AlertDialogAction as ShadcnAlertDialogAction,
  AlertDialogCancel as ShadcnAlertDialogCancel,
  AlertDialogContent as ShadcnAlertDialogContent,
  AlertDialogDescription as ShadcnAlertDialogDescription,
  AlertDialogFooter as ShadcnAlertDialogFooter,
  AlertDialogHeader as ShadcnAlertDialogHeader,
  AlertDialogMedia as ShadcnAlertDialogMedia,
  AlertDialogOverlay as ShadcnAlertDialogOverlay,
  AlertDialogPortal as ShadcnAlertDialogPortal,
  AlertDialogTitle as ShadcnAlertDialogTitle,
  AlertDialogTrigger as ShadcnAlertDialogTrigger,
} from '@components/ui/alert-dialog';
import { cn } from '@lib/utils';

type ShadcnAlertDialogProps = React.ComponentProps<typeof ShadcnAlertDialog>;
interface AlertDialogProps extends ShadcnAlertDialogProps {}

type ShadcnAlertDialogTriggerProps = React.ComponentProps<
  typeof ShadcnAlertDialogTrigger
>;
interface AlertDialogTriggerProps extends ShadcnAlertDialogTriggerProps {}

type ShadcnAlertDialogPortalProps = React.ComponentProps<
  typeof ShadcnAlertDialogPortal
>;
interface AlertDialogPortalProps extends ShadcnAlertDialogPortalProps {}

type ShadcnAlertDialogOverlayProps = React.ComponentProps<
  typeof ShadcnAlertDialogOverlay
>;
interface AlertDialogOverlayProps extends ShadcnAlertDialogOverlayProps {}

type ShadcnAlertDialogContentProps = React.ComponentProps<
  typeof ShadcnAlertDialogContent
>;
interface AlertDialogContentProps extends ShadcnAlertDialogContentProps {}

type ShadcnAlertDialogHeaderProps = React.ComponentProps<
  typeof ShadcnAlertDialogHeader
>;
interface AlertDialogHeaderProps
  extends Omit<ShadcnAlertDialogHeaderProps, 'className' | 'style'> {
  textAlign?: 'start';
}

type ShadcnAlertDialogFooterProps = React.ComponentProps<
  typeof ShadcnAlertDialogFooter
>;
interface AlertDialogFooterProps
  extends Omit<ShadcnAlertDialogFooterProps, 'className' | 'style'> {}

type ShadcnAlertDialogMediaProps = React.ComponentProps<
  typeof ShadcnAlertDialogMedia
>;
interface AlertDialogMediaProps extends ShadcnAlertDialogMediaProps {}

type ShadcnAlertDialogTitleProps = React.ComponentProps<
  typeof ShadcnAlertDialogTitle
>;
interface AlertDialogTitleProps extends ShadcnAlertDialogTitleProps {}

type ShadcnAlertDialogDescriptionProps = React.ComponentProps<
  typeof ShadcnAlertDialogDescription
>;
interface AlertDialogDescriptionProps
  extends ShadcnAlertDialogDescriptionProps {}

type ShadcnAlertDialogActionProps = React.ComponentProps<
  typeof ShadcnAlertDialogAction
>;
interface AlertDialogActionProps extends ShadcnAlertDialogActionProps {}

type ShadcnAlertDialogCancelProps = React.ComponentProps<
  typeof ShadcnAlertDialogCancel
>;
interface AlertDialogCancelProps extends ShadcnAlertDialogCancelProps {}

function AlertDialog(props: AlertDialogProps) {
  return <ShadcnAlertDialog {...props} />;
}

function AlertDialogTrigger(props: AlertDialogTriggerProps) {
  return <ShadcnAlertDialogTrigger {...props} />;
}

function AlertDialogPortal(props: AlertDialogPortalProps) {
  return <ShadcnAlertDialogPortal {...props} />;
}

function AlertDialogOverlay(props: AlertDialogOverlayProps) {
  return <ShadcnAlertDialogOverlay {...props} />;
}

function AlertDialogContent(props: AlertDialogContentProps) {
  return (
    <ShadcnAlertDialogContent
      className={cn('sm:max-w-lg')}
      {...props}
    />
  );
}

function AlertDialogHeader({ textAlign, ...props }: AlertDialogHeaderProps) {
  return (
    <ShadcnAlertDialogHeader
      className={cn(textAlign === 'start' && 'text-start')}
      {...props}
    />
  );
}

function AlertDialogFooter(props: AlertDialogFooterProps) {
  return (
    <ShadcnAlertDialogFooter
      className="sm:justify-between"
      {...props}
    />
  );
}

function AlertDialogMedia(props: AlertDialogMediaProps) {
  return <ShadcnAlertDialogMedia {...props} />;
}

function AlertDialogTitle(props: AlertDialogTitleProps) {
  return <ShadcnAlertDialogTitle {...props} />;
}

function AlertDialogDescription(props: AlertDialogDescriptionProps) {
  return <ShadcnAlertDialogDescription {...props} />;
}

function AlertDialogAction(props: AlertDialogActionProps) {
  return <ShadcnAlertDialogAction {...props} />;
}

function AlertDialogCancel(props: AlertDialogCancelProps) {
  return <ShadcnAlertDialogCancel {...props} />;
}

export {
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
};
