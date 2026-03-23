import { Textarea as ShadcnTextarea } from '@components/ui/textarea';

type ShadcnTextareaProps = React.ComponentProps<typeof ShadcnTextarea>;

interface TextareaProps extends ShadcnTextareaProps {}

function Textarea(props: TextareaProps) {
  return <ShadcnTextarea {...props} />;
}

export { Textarea };
export type { TextareaProps };
