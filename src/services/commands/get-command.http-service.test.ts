import { useGetCommandQueryOptions } from '@services/commands/get-command.http-service';
import {
  PENDING_REFETCH_INTERVAL_MS,
  RUNNING_REFETCH_INTERVAL_MS,
} from '@services/commands/get-command.http-service.constants';

const makeQueryState = (status?: string) => ({
  state: {
    data: status ? { responseData: { results: { status } } } : undefined,
  },
});

describe('useGetCommandQueryOptions', () => {
  describe('refetchInterval', () => {
    it('should return 5000ms for pending status', () => {
      const options = useGetCommandQueryOptions('org-1', 1);
      const result = options.refetchInterval(makeQueryState('pending'));
      expect(result).toBe(PENDING_REFETCH_INTERVAL_MS);
    });

    it('should return 3000ms for running status', () => {
      const options = useGetCommandQueryOptions('org-1', 1);
      const result = options.refetchInterval(makeQueryState('running'));
      expect(result).toBe(RUNNING_REFETCH_INTERVAL_MS);
    });

    it('should return false for completed status', () => {
      const options = useGetCommandQueryOptions('org-1', 1);
      const result = options.refetchInterval(makeQueryState('completed'));
      expect(result).toBe(false);
    });

    it('should return false for failed status', () => {
      const options = useGetCommandQueryOptions('org-1', 1);
      const result = options.refetchInterval(makeQueryState('failed'));
      expect(result).toBe(false);
    });

    it('should return false when data is undefined', () => {
      const options = useGetCommandQueryOptions('org-1', 1);
      const result = options.refetchInterval(makeQueryState());
      expect(result).toBe(false);
    });
  });
});
