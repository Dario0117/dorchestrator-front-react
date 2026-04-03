import {
  Alert as ShadcnAlert,
  AlertAction as ShadcnAlertAction,
  AlertDescription as ShadcnAlertDescription,
  AlertTitle as ShadcnAlertTitle,
} from '@components/ui/alert';
import { cn } from '@lib/utils';

type ShadcnAlertProps = React.ComponentProps<typeof ShadcnAlert>;
type AlertVariant = 'success';

const ALERT_VARIANT: Record<AlertVariant, string> = {
  success:
    'border-green-500 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200',
};

interface AlertProps extends Omit<ShadcnAlertProps, 'className' | 'style'> {
  colorVariant?: AlertVariant;
}

type ShadcnAlertTitleProps = React.ComponentProps<typeof ShadcnAlertTitle>;
interface AlertTitleProps extends ShadcnAlertTitleProps {}

type ShadcnAlertDescriptionProps = React.ComponentProps<
  typeof ShadcnAlertDescription
>;
interface AlertDescriptionProps extends ShadcnAlertDescriptionProps {}

type ShadcnAlertActionProps = React.ComponentProps<typeof ShadcnAlertAction>;
interface AlertActionProps extends ShadcnAlertActionProps {}

function Alert({ colorVariant, ...props }: AlertProps) {
  return (
    <ShadcnAlert
      className={cn(colorVariant && ALERT_VARIANT[colorVariant])}
      {...props}
    />
  );
}

function AlertTitle(props: AlertTitleProps) {
  return <ShadcnAlertTitle {...props} />;
}

function AlertDescription(props: AlertDescriptionProps) {
  return <ShadcnAlertDescription {...props} />;
}

function AlertAction(props: AlertActionProps) {
  return <ShadcnAlertAction {...props} />;
}

export { Alert, AlertAction, AlertDescription, AlertTitle };
