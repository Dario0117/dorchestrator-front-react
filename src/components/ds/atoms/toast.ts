import { toast } from 'sonner';

const SUCCESS_AUTO_DISMISS_MS = 3000;
const INFO_AUTO_DISMISS_MS = 5000;

export const showToast = {
  success(message: string) {
    toast.success(message, { duration: SUCCESS_AUTO_DISMISS_MS });
  },

  error(message: string, options?: { retry?: () => void }) {
    toast.error(message, {
      duration: Number.POSITIVE_INFINITY,
      action: options?.retry
        ? { label: 'Retry', onClick: options.retry }
        : undefined,
    });
  },

  info(message: string) {
    toast.info(message, { duration: INFO_AUTO_DISMISS_MS });
  },
};
