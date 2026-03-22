import {
  Alert as ShadcnAlert,
  AlertAction as ShadcnAlertAction,
  AlertDescription as ShadcnAlertDescription,
  AlertTitle as ShadcnAlertTitle,
} from '@components/ui/alert';

type ShadcnAlertProps = React.ComponentProps<typeof ShadcnAlert>;
interface AlertProps extends ShadcnAlertProps {}

type ShadcnAlertTitleProps = React.ComponentProps<typeof ShadcnAlertTitle>;
interface AlertTitleProps extends ShadcnAlertTitleProps {}

type ShadcnAlertDescriptionProps = React.ComponentProps<
  typeof ShadcnAlertDescription
>;
interface AlertDescriptionProps extends ShadcnAlertDescriptionProps {}

type ShadcnAlertActionProps = React.ComponentProps<typeof ShadcnAlertAction>;
interface AlertActionProps extends ShadcnAlertActionProps {}

function Alert(props: AlertProps) {
  return <ShadcnAlert {...props} />;
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
export type {
  AlertActionProps,
  AlertDescriptionProps,
  AlertProps,
  AlertTitleProps,
};
