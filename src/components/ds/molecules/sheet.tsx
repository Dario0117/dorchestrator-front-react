import {
  Sheet as UiSheet,
  SheetClose as UiSheetClose,
  SheetContent as UiSheetContent,
  SheetDescription as UiSheetDescription,
  SheetFooter as UiSheetFooter,
  SheetHeader as UiSheetHeader,
  SheetTitle as UiSheetTitle,
  SheetTrigger as UiSheetTrigger,
} from '@components/ui/sheet';

function Sheet(props: React.ComponentProps<typeof UiSheet>) {
  return <UiSheet {...props} />;
}

function SheetTrigger(props: React.ComponentProps<typeof UiSheetTrigger>) {
  return <UiSheetTrigger {...props} />;
}

function SheetClose(props: React.ComponentProps<typeof UiSheetClose>) {
  return <UiSheetClose {...props} />;
}

function SheetContent({
  side,
  showCloseButton,
  ...props
}: React.ComponentProps<typeof UiSheetContent>) {
  return (
    <UiSheetContent
      side={side}
      showCloseButton={showCloseButton}
      {...props}
    />
  );
}

function SheetHeader(props: React.ComponentProps<typeof UiSheetHeader>) {
  return <UiSheetHeader {...props} />;
}

function SheetFooter(props: React.ComponentProps<typeof UiSheetFooter>) {
  return <UiSheetFooter {...props} />;
}

function SheetTitle(props: React.ComponentProps<typeof UiSheetTitle>) {
  return <UiSheetTitle {...props} />;
}

function SheetDescription(
  props: React.ComponentProps<typeof UiSheetDescription>,
) {
  return <UiSheetDescription {...props} />;
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
};
