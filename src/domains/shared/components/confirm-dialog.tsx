import { Box } from '@components/ds/atoms/box';
import { Button } from '@components/ds/atoms/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@components/ds/molecules/alert-dialog';
import type { ConfirmDialogProps } from '@domains/shared/components/confirm-dialog.types';

export function ConfirmDialog(props: ConfirmDialogProps) {
  const {
    title,
    desc,
    children,
    size: _size,
    confirmText,
    cancelBtnText,
    destructive,
    isLoading,
    disabled = false,
    handleConfirm,
    ...actions
  } = props;
  return (
    <AlertDialog {...actions}>
      <AlertDialogContent>
        <AlertDialogHeader textAlign="start">
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription render={<Box />}>
            {desc}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelBtnText ?? 'Cancel'}
          </AlertDialogCancel>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={disabled || isLoading}
          >
            {confirmText ?? 'Continue'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
