import {
  Card as ShadcnCard,
  CardAction as ShadcnCardAction,
  CardContent as ShadcnCardContent,
  CardDescription as ShadcnCardDescription,
  CardFooter as ShadcnCardFooter,
  CardHeader as ShadcnCardHeader,
  CardTitle as ShadcnCardTitle,
} from '@components/ui/card';

type ShadcnCardProps = React.ComponentProps<typeof ShadcnCard>;
interface CardProps extends ShadcnCardProps {}

function Card(props: CardProps) {
  return <ShadcnCard {...props} />;
}

type ShadcnCardHeaderProps = React.ComponentProps<typeof ShadcnCardHeader>;
interface CardHeaderProps extends ShadcnCardHeaderProps {}

function CardHeader(props: CardHeaderProps) {
  return <ShadcnCardHeader {...props} />;
}

type ShadcnCardTitleProps = React.ComponentProps<typeof ShadcnCardTitle>;
interface CardTitleProps extends ShadcnCardTitleProps {}

function CardTitle(props: CardTitleProps) {
  return <ShadcnCardTitle {...props} />;
}

type ShadcnCardDescriptionProps = React.ComponentProps<
  typeof ShadcnCardDescription
>;
interface CardDescriptionProps extends ShadcnCardDescriptionProps {}

function CardDescription(props: CardDescriptionProps) {
  return <ShadcnCardDescription {...props} />;
}

type ShadcnCardActionProps = React.ComponentProps<typeof ShadcnCardAction>;
interface CardActionProps extends ShadcnCardActionProps {}

function CardAction(props: CardActionProps) {
  return <ShadcnCardAction {...props} />;
}

type ShadcnCardContentProps = React.ComponentProps<typeof ShadcnCardContent>;
interface CardContentProps extends ShadcnCardContentProps {}

function CardContent(props: CardContentProps) {
  return <ShadcnCardContent {...props} />;
}

type ShadcnCardFooterProps = React.ComponentProps<typeof ShadcnCardFooter>;
interface CardFooterProps extends ShadcnCardFooterProps {}

function CardFooter(props: CardFooterProps) {
  return <ShadcnCardFooter {...props} />;
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
};
export type {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardActionProps,
  CardContentProps,
  CardFooterProps,
};
