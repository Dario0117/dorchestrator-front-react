import { useSandboxConfigForm } from '@domains/sandbox/forms/hooks/use-sandbox-config-form';
import type { useCreateSandboxPresetMutationType } from '@domains/sandbox/services/create-sandbox-preset.http-service';
import type { useUpdateSandboxPresetMutationType } from '@domains/sandbox/services/update-sandbox-preset.http-service';
import * as loggerUtils from '@lib/logger.utils';
import { createQueryThemeWrapper } from '@lib/test-wrappers.utils';
import { act, renderHook, waitFor } from '@testing-library/react';

function createMockMutations(overrides?: {
  createMutate?: ReturnType<typeof vi.fn>;
  updateMutate?: ReturnType<typeof vi.fn>;
}) {
  const createMutation = {
    mutate: overrides?.createMutate ?? vi.fn(),
  } as unknown as useCreateSandboxPresetMutationType;

  const updateMutation = {
    mutate: overrides?.updateMutate ?? vi.fn(),
  } as unknown as useUpdateSandboxPresetMutationType;

  return { createMutation, updateMutation };
}

function createErrorCreateMutation(error: {
  responseErrors?: Record<string, string[]> | null;
}): useCreateSandboxPresetMutationType {
  return {
    mutate: vi.fn((_, options) => {
      options?.onError?.(error as never, undefined as never, undefined);
    }),
  } as unknown as useCreateSandboxPresetMutationType;
}

function createErrorUpdateMutation(error: {
  responseErrors?: Record<string, string[]> | null;
}): useUpdateSandboxPresetMutationType {
  return {
    mutate: vi.fn((_, options) => {
      options?.onError?.(error as never, undefined as never, undefined);
    }),
  } as unknown as useUpdateSandboxPresetMutationType;
}

const DEFAULT_PROPS = {
  mode: 'create' as const,
  organizationId: 'org-1',
  handleSuccess: vi.fn(),
  noSandboxTypeId: 0,
};

describe('useSandboxConfigForm', () => {
  describe('initialization', () => {
    it('should initialize with empty default values when none provided', () => {
      const { createMutation, updateMutation } = createMockMutations();
      const handleSuccess = vi.fn();

      const { result } = renderHook(
        () =>
          useSandboxConfigForm({
            ...DEFAULT_PROPS,
            createMutation,
            updateMutation,
            handleSuccess,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      expect(result.current.state.values.name).toBe('');
      expect(result.current.state.values.description).toBe('');
      expect(result.current.state.values.requiresApproval).toBe('false');
      expect(result.current.state.values.sandboxTypeId).toBe(0);
      expect(result.current.state.values.networkMode).toBe('');
      expect(result.current.state.values.image).toBe('');
      expect(result.current.state.values.maxTimeoutMs).toBe('');
      expect(result.current.state.values.maxOutputSize).toBe('');
      expect(result.current.state.values.pidsLimit).toBe('');
      expect(result.current.state.values.allowExternal).toEqual([]);
      expect(result.current.state.values.allowLocal).toEqual([]);
      expect(result.current.state.values.denyExternal).toEqual([]);
      expect(result.current.state.values.denyLocal).toEqual([]);
    });

    it('should initialize with provided default values', () => {
      const { createMutation, updateMutation } = createMockMutations();

      const { result } = renderHook(
        () =>
          useSandboxConfigForm({
            ...DEFAULT_PROPS,
            createMutation,
            updateMutation,
            defaultValues: {
              name: 'My Preset',
              description: 'A description',
              requiresApproval: true,
              sandboxTypeId: 5,
              networkMode: 'allow-list',
              image: 'ubuntu:latest',
              maxTimeoutMs: 30000,
              maxOutputSize: 1024,
              pidsLimit: 100,
              allowExternal: [{ host: 'example.com', ports: [80, 443] }],
              allowLocal: [{ host: 'localhost', ports: [3000] }],
              denyExternal: [{ host: 'evil.com', ports: [] }],
              denyLocal: [{ host: '192.168.1.1', ports: [22] }],
            },
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      expect(result.current.state.values.name).toBe('My Preset');
      expect(result.current.state.values.description).toBe('A description');
      expect(result.current.state.values.requiresApproval).toBe('true');
      expect(result.current.state.values.sandboxTypeId).toBe(5);
      expect(result.current.state.values.networkMode).toBe('allow-list');
      expect(result.current.state.values.image).toBe('ubuntu:latest');
      expect(result.current.state.values.maxTimeoutMs).toBe(30000);
      expect(result.current.state.values.maxOutputSize).toBe(1024);
      expect(result.current.state.values.pidsLimit).toBe(100);
      expect(result.current.state.values.allowExternal).toHaveLength(1);
      expect(result.current.state.values.allowExternal[0]!.host).toBe(
        'example.com',
      );
      expect(result.current.state.values.allowExternal[0]!.ports).toBe(
        '80, 443',
      );
      expect(result.current.state.values.allowLocal).toHaveLength(1);
      expect(result.current.state.values.allowLocal[0]!.host).toBe('localhost');
      expect(result.current.state.values.allowLocal[0]!.ports).toBe('3000');
      expect(result.current.state.values.denyExternal).toHaveLength(1);
      expect(result.current.state.values.denyExternal[0]!.host).toBe(
        'evil.com',
      );
      expect(result.current.state.values.denyExternal[0]!.ports).toBe('');
      expect(result.current.state.values.denyLocal).toHaveLength(1);
      expect(result.current.state.values.denyLocal[0]!.host).toBe(
        '192.168.1.1',
      );
      expect(result.current.state.values.denyLocal[0]!.ports).toBe('22');
    });

    it('should use noSandboxTypeId when sandboxTypeId is not provided', () => {
      const { createMutation, updateMutation } = createMockMutations();

      const { result } = renderHook(
        () =>
          useSandboxConfigForm({
            ...DEFAULT_PROPS,
            createMutation,
            updateMutation,
            noSandboxTypeId: 42,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      expect(result.current.state.values.sandboxTypeId).toBe(42);
    });

    it('should set requiresApproval to false when defaultValues.requiresApproval is false', () => {
      const { createMutation, updateMutation } = createMockMutations();

      const { result } = renderHook(
        () =>
          useSandboxConfigForm({
            ...DEFAULT_PROPS,
            createMutation,
            updateMutation,
            defaultValues: {
              requiresApproval: false,
            },
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      expect(result.current.state.values.requiresApproval).toBe('false');
    });
  });

  describe('create mode submission', () => {
    it('should call createMutation with minimal body on submit', async () => {
      const createMutate = vi.fn((_, options) => {
        options?.onSuccess?.(undefined as never, undefined as never, undefined);
      });
      const { createMutation, updateMutation } = createMockMutations({
        createMutate,
      });
      const handleSuccess = vi.fn();

      const { result } = renderHook(
        () =>
          useSandboxConfigForm({
            ...DEFAULT_PROPS,
            createMutation,
            updateMutation,
            handleSuccess,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await act(async () => {
        result.current.setFieldValue('name', 'Test Preset');
        result.current.setFieldValue('sandboxTypeId', 1);
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(createMutate).toHaveBeenCalledWith(
          {
            body: {
              name: 'Test Preset',
              sandboxTypeId: 1,
              requiresApproval: false,
            },
            params: { path: { organizationId: 'org-1' } },
          },
          expect.any(Object),
        );
        expect(handleSuccess).toHaveBeenCalled();
      });
    });

    it('should include description when provided', async () => {
      const createMutate = vi.fn((_, options) => {
        options?.onSuccess?.(undefined as never, undefined as never, undefined);
      });
      const { createMutation, updateMutation } = createMockMutations({
        createMutate,
      });

      const { result } = renderHook(
        () =>
          useSandboxConfigForm({
            ...DEFAULT_PROPS,
            createMutation,
            updateMutation,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await act(async () => {
        result.current.setFieldValue('name', 'Test');
        result.current.setFieldValue('sandboxTypeId', 1);
        result.current.setFieldValue('description', 'A test description');
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(createMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            body: expect.objectContaining({
              description: 'A test description',
            }),
          }),
          expect.any(Object),
        );
      });
    });

    it('should include pluginConfig when image is provided', async () => {
      const createMutate = vi.fn((_, options) => {
        options?.onSuccess?.(undefined as never, undefined as never, undefined);
      });
      const { createMutation, updateMutation } = createMockMutations({
        createMutate,
      });

      const { result } = renderHook(
        () =>
          useSandboxConfigForm({
            ...DEFAULT_PROPS,
            createMutation,
            updateMutation,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await act(async () => {
        result.current.setFieldValue('name', 'Test');
        result.current.setFieldValue('sandboxTypeId', 1);
        result.current.setFieldValue('image', 'node:20');
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(createMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            body: expect.objectContaining({
              pluginConfig: { image: 'node:20' },
            }),
          }),
          expect.any(Object),
        );
      });
    });

    it('should include resourceLimits when numeric fields are provided', async () => {
      const createMutate = vi.fn((_, options) => {
        options?.onSuccess?.(undefined as never, undefined as never, undefined);
      });
      const { createMutation, updateMutation } = createMockMutations({
        createMutate,
      });

      const { result } = renderHook(
        () =>
          useSandboxConfigForm({
            ...DEFAULT_PROPS,
            createMutation,
            updateMutation,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await act(async () => {
        result.current.setFieldValue('name', 'Test');
        result.current.setFieldValue('sandboxTypeId', 1);
        result.current.setFieldValue('maxTimeoutMs', 5000);
        result.current.setFieldValue('maxOutputSize', 2048);
        result.current.setFieldValue('pidsLimit', 50);
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(createMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            body: expect.objectContaining({
              resourceLimits: {
                maxTimeoutMs: 5000,
                maxOutputSize: 2048,
                pidsLimit: 50,
              },
            }),
          }),
          expect.any(Object),
        );
      });
    });

    it('should include allow-list network policy when networkMode is allow-list', async () => {
      const createMutate = vi.fn((_, options) => {
        options?.onSuccess?.(undefined as never, undefined as never, undefined);
      });
      const { createMutation, updateMutation } = createMockMutations({
        createMutate,
      });

      const { result } = renderHook(
        () =>
          useSandboxConfigForm({
            ...DEFAULT_PROPS,
            createMutation,
            updateMutation,
            defaultValues: {
              allowExternal: [{ host: 'example.com', ports: [80] }],
              allowLocal: [{ host: 'localhost', ports: [3000] }],
            },
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await act(async () => {
        result.current.setFieldValue('name', 'Test');
        result.current.setFieldValue('sandboxTypeId', 1);
        result.current.setFieldValue('networkMode', 'allow-list');
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(createMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            body: expect.objectContaining({
              networkPolicy: {
                mode: 'allow-list',
                allow: {
                  external: [{ host: 'example.com', ports: [80] }],
                  local: [{ host: 'localhost', ports: [3000] }],
                },
              },
            }),
          }),
          expect.any(Object),
        );
      });
    });

    it('should include deny-list network policy when networkMode is deny-list', async () => {
      const createMutate = vi.fn((_, options) => {
        options?.onSuccess?.(undefined as never, undefined as never, undefined);
      });
      const { createMutation, updateMutation } = createMockMutations({
        createMutate,
      });

      const { result } = renderHook(
        () =>
          useSandboxConfigForm({
            ...DEFAULT_PROPS,
            createMutation,
            updateMutation,
            defaultValues: {
              denyExternal: [{ host: 'evil.com', ports: [443] }],
              denyLocal: [{ host: '10.0.0.1', ports: [22] }],
            },
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await act(async () => {
        result.current.setFieldValue('name', 'Test');
        result.current.setFieldValue('sandboxTypeId', 1);
        result.current.setFieldValue('networkMode', 'deny-list');
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(createMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            body: expect.objectContaining({
              networkPolicy: {
                mode: 'deny-list',
                deny: {
                  external: [{ host: 'evil.com', ports: [443] }],
                  local: [{ host: '10.0.0.1', ports: [22] }],
                },
              },
            }),
          }),
          expect.any(Object),
        );
      });
    });

    it('should include base network policy for non-list modes like allow-all', async () => {
      const createMutate = vi.fn((_, options) => {
        options?.onSuccess?.(undefined as never, undefined as never, undefined);
      });
      const { createMutation, updateMutation } = createMockMutations({
        createMutate,
      });

      const { result } = renderHook(
        () =>
          useSandboxConfigForm({
            ...DEFAULT_PROPS,
            createMutation,
            updateMutation,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await act(async () => {
        result.current.setFieldValue('name', 'Test');
        result.current.setFieldValue('sandboxTypeId', 1);
        result.current.setFieldValue('networkMode', 'allow-all');
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(createMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            body: expect.objectContaining({
              networkPolicy: { mode: 'allow-all' },
            }),
          }),
          expect.any(Object),
        );
      });
    });

    it('should not include networkPolicy when networkMode is empty', async () => {
      const createMutate = vi.fn((_, options) => {
        options?.onSuccess?.(undefined as never, undefined as never, undefined);
      });
      const { createMutation, updateMutation } = createMockMutations({
        createMutate,
      });

      const { result } = renderHook(
        () =>
          useSandboxConfigForm({
            ...DEFAULT_PROPS,
            createMutation,
            updateMutation,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await act(async () => {
        result.current.setFieldValue('name', 'Test');
        result.current.setFieldValue('sandboxTypeId', 1);
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        const callBody = createMutate.mock.calls[0]![0]!.body;
        expect(callBody.networkPolicy).toBeUndefined();
      });
    });
  });

  describe('edit mode submission', () => {
    it('should call updateMutation when mode is edit and presetId is provided', async () => {
      const updateMutate = vi.fn((_, options) => {
        options?.onSuccess?.(undefined as never, undefined as never, undefined);
      });
      const { createMutation, updateMutation } = createMockMutations({
        updateMutate,
      });
      const handleSuccess = vi.fn();

      const { result } = renderHook(
        () =>
          useSandboxConfigForm({
            mode: 'edit',
            organizationId: 'org-1',
            presetId: 7,
            createMutation,
            updateMutation,
            handleSuccess,
            noSandboxTypeId: 0,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await act(async () => {
        result.current.setFieldValue('name', 'Updated Preset');
        result.current.setFieldValue('sandboxTypeId', 2);
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(updateMutate).toHaveBeenCalledWith(
          {
            body: {
              name: 'Updated Preset',
              sandboxTypeId: 2,
              requiresApproval: false,
            },
            params: {
              path: { organizationId: 'org-1', presetId: '7' },
            },
          },
          expect.any(Object),
        );
        expect(handleSuccess).toHaveBeenCalled();
      });
    });

    it('should fallback to createMutation when mode is edit but presetId is undefined', async () => {
      const createMutate = vi.fn((_, options) => {
        options?.onSuccess?.(undefined as never, undefined as never, undefined);
      });
      const updateMutate = vi.fn();
      const { createMutation, updateMutation } = createMockMutations({
        createMutate,
        updateMutate,
      });

      const { result } = renderHook(
        () =>
          useSandboxConfigForm({
            mode: 'edit',
            organizationId: 'org-1',
            createMutation,
            updateMutation,
            handleSuccess: vi.fn(),
            noSandboxTypeId: 0,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await act(async () => {
        result.current.setFieldValue('name', 'Test');
        result.current.setFieldValue('sandboxTypeId', 1);
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(createMutate).toHaveBeenCalled();
        expect(updateMutate).not.toHaveBeenCalled();
      });
    });
  });

  describe('error handling', () => {
    it('should log error and set form errors on create mutation error', async () => {
      vi.spyOn(loggerUtils, 'logError').mockImplementation(vi.fn());
      const createMutation = createErrorCreateMutation({
        responseErrors: { name: ['Name is already taken'] },
      });
      const { updateMutation } = createMockMutations();
      const handleSuccess = vi.fn();

      const { result } = renderHook(
        () =>
          useSandboxConfigForm({
            ...DEFAULT_PROPS,
            createMutation,
            updateMutation,
            handleSuccess,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await act(async () => {
        result.current.setFieldValue('name', 'Duplicate');
        result.current.setFieldValue('sandboxTypeId', 1);
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(loggerUtils.logError).toHaveBeenCalledWith(
          expect.objectContaining({ error: expect.anything() }),
          'Sandbox preset save failed',
        );
        expect(handleSuccess).not.toHaveBeenCalled();
      });
    });

    it('should log error and set form errors on update mutation error', async () => {
      vi.spyOn(loggerUtils, 'logError').mockImplementation(vi.fn());
      const { createMutation } = createMockMutations();
      const updateMutation = createErrorUpdateMutation({
        responseErrors: null,
      });
      const handleSuccess = vi.fn();

      const { result } = renderHook(
        () =>
          useSandboxConfigForm({
            mode: 'edit',
            organizationId: 'org-1',
            presetId: 5,
            createMutation,
            updateMutation,
            handleSuccess,
            noSandboxTypeId: 0,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await act(async () => {
        result.current.setFieldValue('name', 'Test');
        result.current.setFieldValue('sandboxTypeId', 1);
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(loggerUtils.logError).toHaveBeenCalled();
        expect(handleSuccess).not.toHaveBeenCalled();
      });
    });
  });

  describe('host entry and port conversion', () => {
    it('should convert host entries with multiple ports to form entries', () => {
      const { createMutation, updateMutation } = createMockMutations();

      const { result } = renderHook(
        () =>
          useSandboxConfigForm({
            ...DEFAULT_PROPS,
            createMutation,
            updateMutation,
            defaultValues: {
              allowExternal: [
                { host: 'api.example.com', ports: [80, 443, 8080] },
                { host: 'db.example.com', ports: [5432] },
              ],
            },
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      expect(result.current.state.values.allowExternal).toHaveLength(2);
      expect(result.current.state.values.allowExternal[0]!.host).toBe(
        'api.example.com',
      );
      expect(result.current.state.values.allowExternal[0]!.ports).toBe(
        '80, 443, 8080',
      );
      expect(result.current.state.values.allowExternal[1]!.host).toBe(
        'db.example.com',
      );
      expect(result.current.state.values.allowExternal[1]!.ports).toBe('5432');
    });

    it('should convert empty port arrays to empty strings', () => {
      const { createMutation, updateMutation } = createMockMutations();

      const { result } = renderHook(
        () =>
          useSandboxConfigForm({
            ...DEFAULT_PROPS,
            createMutation,
            updateMutation,
            defaultValues: {
              denyExternal: [{ host: 'blocked.com', ports: [] }],
            },
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      expect(result.current.state.values.denyExternal[0]!.ports).toBe('');
    });

    it('should filter out entries with empty host when converting form to host entries', async () => {
      const createMutate = vi.fn((_, options) => {
        options?.onSuccess?.(undefined as never, undefined as never, undefined);
      });
      const { createMutation, updateMutation } = createMockMutations({
        createMutate,
      });

      const { result } = renderHook(
        () =>
          useSandboxConfigForm({
            ...DEFAULT_PROPS,
            createMutation,
            updateMutation,
            defaultValues: {
              allowExternal: [{ host: 'valid.com', ports: [80] }],
            },
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await act(async () => {
        // Add an entry with empty host
        result.current.setFieldValue('allowExternal', [
          ...result.current.state.values.allowExternal,
          { id: 'empty-id', host: '  ', ports: '' },
        ]);
        result.current.setFieldValue('name', 'Test');
        result.current.setFieldValue('sandboxTypeId', 1);
        result.current.setFieldValue('networkMode', 'allow-list');
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        const body = createMutate.mock.calls[0]![0]!.body;
        // The empty host entry should be filtered out
        expect(body.networkPolicy.allow.external).toEqual([
          { host: 'valid.com', ports: [80] },
        ]);
      });
    });

    it('should parse port strings with invalid values filtering them out', async () => {
      const createMutate = vi.fn((_, options) => {
        options?.onSuccess?.(undefined as never, undefined as never, undefined);
      });
      const { createMutation, updateMutation } = createMockMutations({
        createMutate,
      });

      const { result } = renderHook(
        () =>
          useSandboxConfigForm({
            ...DEFAULT_PROPS,
            createMutation,
            updateMutation,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await act(async () => {
        result.current.setFieldValue('name', 'Test');
        result.current.setFieldValue('sandboxTypeId', 1);
        result.current.setFieldValue('networkMode', 'deny-list');
        result.current.setFieldValue('denyExternal', [
          { id: 'test-id', host: 'bad.com', ports: '80, abc, -1, 443, 0' },
        ]);
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        const body = createMutate.mock.calls[0]![0]!.body;
        // abc, -1, and 0 should be filtered out (NaN and non-positive)
        expect(body.networkPolicy.deny.external).toEqual([
          { host: 'bad.com', ports: [80, 443] },
        ]);
      });
    });

    it('should handle undefined port strings as empty arrays', async () => {
      const createMutate = vi.fn((_, options) => {
        options?.onSuccess?.(undefined as never, undefined as never, undefined);
      });
      const { createMutation, updateMutation } = createMockMutations({
        createMutate,
      });

      const { result } = renderHook(
        () =>
          useSandboxConfigForm({
            ...DEFAULT_PROPS,
            createMutation,
            updateMutation,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await act(async () => {
        result.current.setFieldValue('name', 'Test');
        result.current.setFieldValue('sandboxTypeId', 1);
        result.current.setFieldValue('networkMode', 'allow-list');
        result.current.setFieldValue('allowExternal', [
          {
            id: 'test-id',
            host: 'example.com',
            ports: undefined as unknown as string,
          },
        ]);
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        const body = createMutate.mock.calls[0]![0]!.body;
        expect(body.networkPolicy.allow.external).toEqual([
          { host: 'example.com', ports: [] },
        ]);
      });
    });

    it('should handle whitespace-only port strings as empty arrays', async () => {
      const createMutate = vi.fn((_, options) => {
        options?.onSuccess?.(undefined as never, undefined as never, undefined);
      });
      const { createMutation, updateMutation } = createMockMutations({
        createMutate,
      });

      const { result } = renderHook(
        () =>
          useSandboxConfigForm({
            ...DEFAULT_PROPS,
            createMutation,
            updateMutation,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await act(async () => {
        result.current.setFieldValue('name', 'Test');
        result.current.setFieldValue('sandboxTypeId', 1);
        result.current.setFieldValue('networkMode', 'allow-list');
        result.current.setFieldValue('allowExternal', [
          { id: 'test-id', host: 'example.com', ports: '   ' },
        ]);
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        const body = createMutate.mock.calls[0]![0]!.body;
        expect(body.networkPolicy.allow.external).toEqual([
          { host: 'example.com', ports: [] },
        ]);
      });
    });

    it('should handle empty host entries array', () => {
      const { createMutation, updateMutation } = createMockMutations();

      const { result } = renderHook(
        () =>
          useSandboxConfigForm({
            ...DEFAULT_PROPS,
            createMutation,
            updateMutation,
            defaultValues: {
              allowExternal: [],
            },
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      expect(result.current.state.values.allowExternal).toEqual([]);
    });
  });

  describe('requiresApproval field', () => {
    it('should submit requiresApproval as true when set to true string', async () => {
      const createMutate = vi.fn((_, options) => {
        options?.onSuccess?.(undefined as never, undefined as never, undefined);
      });
      const { createMutation, updateMutation } = createMockMutations({
        createMutate,
      });

      const { result } = renderHook(
        () =>
          useSandboxConfigForm({
            ...DEFAULT_PROPS,
            createMutation,
            updateMutation,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await act(async () => {
        result.current.setFieldValue('name', 'Test');
        result.current.setFieldValue('sandboxTypeId', 1);
        result.current.setFieldValue('requiresApproval', 'true');
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(createMutate.mock.calls[0]![0]!.body.requiresApproval).toBe(
          true,
        );
      });
    });
  });

  describe('resource limits edge cases', () => {
    it('should not include resourceLimits when all numeric fields are empty strings', async () => {
      const createMutate = vi.fn((_, options) => {
        options?.onSuccess?.(undefined as never, undefined as never, undefined);
      });
      const { createMutation, updateMutation } = createMockMutations({
        createMutate,
      });

      const { result } = renderHook(
        () =>
          useSandboxConfigForm({
            ...DEFAULT_PROPS,
            createMutation,
            updateMutation,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await act(async () => {
        result.current.setFieldValue('name', 'Test');
        result.current.setFieldValue('sandboxTypeId', 1);
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        const body = createMutate.mock.calls[0]![0]!.body;
        expect(body.resourceLimits).toBeUndefined();
      });
    });

    it('should include partial resourceLimits when only some fields are set', async () => {
      const createMutate = vi.fn((_, options) => {
        options?.onSuccess?.(undefined as never, undefined as never, undefined);
      });
      const { createMutation, updateMutation } = createMockMutations({
        createMutate,
      });

      const { result } = renderHook(
        () =>
          useSandboxConfigForm({
            ...DEFAULT_PROPS,
            createMutation,
            updateMutation,
          }),
        { wrapper: createQueryThemeWrapper() },
      );

      await act(async () => {
        result.current.setFieldValue('name', 'Test');
        result.current.setFieldValue('sandboxTypeId', 1);
        result.current.setFieldValue('maxTimeoutMs', 10000);
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        const body = createMutate.mock.calls[0]![0]!.body;
        expect(body.resourceLimits).toEqual({ maxTimeoutMs: 10000 });
      });
    });
  });
});
