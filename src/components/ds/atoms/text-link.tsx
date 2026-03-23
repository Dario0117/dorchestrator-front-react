interface TextLinkProps
  extends Omit<React.ComponentProps<'a'>, 'className' | 'style'> {
  href: string;
  external?: boolean;
}

function TextLink({ external, ref, ...props }: TextLinkProps) {
  return (
    <a
      ref={ref}
      className="text-sm text-primary hover:underline"
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
      {...props}
    />
  );
}

export { TextLink };
export type { TextLinkProps };
