interface FileThumbOverlayProps
  extends Omit<React.ComponentProps<'div'>, 'className' | 'style'> {}

function FileThumbOverlay(props: FileThumbOverlayProps) {
  return (
    <div
      className="absolute inset-x-0 bottom-0 bg-black/50 px-1 py-0.5 text-[9px] text-white opacity-0 transition-opacity group-hover:opacity-100"
      {...props}
    />
  );
}

export { FileThumbOverlay };
