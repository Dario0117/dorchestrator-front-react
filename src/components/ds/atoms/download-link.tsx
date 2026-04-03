interface DownloadLinkProps
  extends Omit<React.ComponentProps<'a'>, 'className' | 'style'> {
  href: string;
  download: string;
}

function DownloadLink({ ref, ...props }: DownloadLinkProps) {
  return (
    <a
      ref={ref}
      className="text-xs text-primary hover:underline"
      {...props}
    />
  );
}

export { DownloadLink };
