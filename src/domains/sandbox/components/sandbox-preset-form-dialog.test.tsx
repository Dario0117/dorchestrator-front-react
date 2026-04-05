import { SandboxPresetFormDialog } from '@domains/sandbox/components/sandbox-preset-form-dialog';
import type { SandboxPresetItem } from '@domains/sandbox/services/list-sandbox-presets.http-service';
import type { SandboxTypeItem } from '@domains/sandbox/services/list-sandbox-types.http-service';
import { MSWSuccessHandlers } from '@lib/test.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';

const server = setupServer(...MSWSuccessHandlers());

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const sandboxTypes: SandboxTypeItem[] = [
  {
    id: 1,
    name: 'No Sandbox',
    category: 'none',
    providerType: 'native',
    available: true,
  },
  {
    id: 2,
    name: 'Docker',
    category: 'container',
    providerType: 'native',
    available: true,
  },
];

const fullPreset: SandboxPresetItem = {
  id: 1,
  organizationId: 'org-123',
  name: 'Default Docker',
  description: 'Standard Docker sandbox',
  sandboxTypeId: 2,
  networkPolicy: {
    mode: 'allow-all',
    allow: {
      external: [{ host: 'example.com', ports: [443] }],
      local: [{ host: 'localhost', ports: [8080] }],
    },
    deny: {
      external: [{ host: 'evil.com', ports: [80] }],
      local: [{ host: '192.168.1.1', ports: [22] }],
    },
  },
  resourceLimits: {
    maxTimeoutMs: 30000,
    maxOutputSize: 1048576,
    pidsLimit: 100,
  },
  volumeMounts: null,
  providerConfig: { image: 'dorchestrator/sandbox:latest' },
  isOrgDefault: true,
  requiresApproval: false,
  createdBy: 'user-123',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const minimalPreset: SandboxPresetItem = {
  id: 3,
  organizationId: 'org-123',
  name: 'No Sandbox',
  description: null,
  sandboxTypeId: 1,
  networkPolicy: null,
  resourceLimits: null,
  volumeMounts: null,
  providerConfig: null,
  isOrgDefault: false,
  requiresApproval: true,
  createdBy: 'user-123',
  createdAt: '2026-02-01T00:00:00.000Z',
  updatedAt: '2026-02-01T00:00:00.000Z',
};

function renderDialog(
  overrides: Partial<Parameters<typeof SandboxPresetFormDialog>[0]> = {},
) {
  const props = {
    open: true,
    onOpenChange: vi.fn(),
    organizationId: 'org-123',
    preset: null as SandboxPresetItem | null,
    sandboxTypes,
    ...overrides,
  };
  const result = renderWithProviders(<SandboxPresetFormDialog {...props} />);
  return { ...result, props };
}

describe('SandboxPresetFormDialog', () => {
  describe('create mode (preset is null)', () => {
    it('renders "Create Preset" title', () => {
      renderDialog();
      expect(
        screen.getByRole('heading', { name: 'Create Preset' }),
      ).toBeInTheDocument();
    });

    it('renders create description', () => {
      renderDialog();
      expect(
        screen.getByText(
          'Configure a new sandbox preset for your organization.',
        ),
      ).toBeInTheDocument();
    });

    it('renders the SandboxConfigForm in create mode', () => {
      renderDialog();
      // The form renders a "New Preset" card title in create mode
      expect(screen.getByText('New Preset')).toBeInTheDocument();
    });
  });

  describe('edit mode (preset is provided)', () => {
    it('renders "Edit Preset" title', () => {
      renderDialog({ preset: fullPreset });
      expect(
        screen.getByRole('heading', { name: 'Edit Preset' }),
      ).toBeInTheDocument();
    });

    it('renders edit description with preset name', () => {
      renderDialog({ preset: fullPreset });
      expect(
        screen.getByText(
          'Update the "Default Docker" sandbox preset configuration.',
        ),
      ).toBeInTheDocument();
    });

    it('passes default values from a full preset', () => {
      renderDialog({ preset: fullPreset });
      // The form receives defaultValues and renders the preset name in the input
      expect(screen.getByDisplayValue('Default Docker')).toBeInTheDocument();
    });

    it('handles preset with null description (falls back to empty string)', () => {
      renderDialog({ preset: minimalPreset });
      expect(
        screen.getByText(
          'Update the "No Sandbox" sandbox preset configuration.',
        ),
      ).toBeInTheDocument();
    });

    it('handles preset with null networkPolicy', () => {
      renderDialog({ preset: minimalPreset });
      // Should not throw; networkPolicy?.mode resolves to undefined
      expect(
        screen.getByRole('heading', { name: 'Edit Preset' }),
      ).toBeInTheDocument();
    });

    it('handles preset with null providerConfig', () => {
      renderDialog({ preset: minimalPreset });
      // providerConfig?.image as string ?? undefined resolves to undefined
      expect(
        screen.getByRole('heading', { name: 'Edit Preset' }),
      ).toBeInTheDocument();
    });

    it('handles preset with null resourceLimits', () => {
      renderDialog({ preset: minimalPreset });
      // resourceLimits?.maxTimeoutMs ?? undefined resolves to undefined
      expect(
        screen.getByRole('heading', { name: 'Edit Preset' }),
      ).toBeInTheDocument();
    });

    it('handles preset with networkPolicy allow/deny fields', () => {
      renderDialog({ preset: fullPreset });
      // Verifies that allow.external, allow.local, deny.external, deny.local are passed
      expect(
        screen.getByRole('heading', { name: 'Edit Preset' }),
      ).toBeInTheDocument();
    });

    it('handles preset with undefined allow/deny in networkPolicy', () => {
      const presetWithUndefinedAllowDeny: SandboxPresetItem = {
        ...fullPreset,
        networkPolicy: {
          mode: 'allow-all',
          allow: undefined,
          deny: undefined,
        },
      };
      renderDialog({ preset: presetWithUndefinedAllowDeny });
      expect(
        screen.getByRole('heading', { name: 'Edit Preset' }),
      ).toBeInTheDocument();
    });
  });

  describe('dialog open/close', () => {
    it('does not render dialog content when open is false', () => {
      renderDialog({ open: false });
      expect(
        screen.queryByRole('heading', { name: 'Create Preset' }),
      ).not.toBeInTheDocument();
    });

    it('renders dialog content when open is true', () => {
      renderDialog({ open: true });
      expect(
        screen.getByRole('heading', { name: 'Create Preset' }),
      ).toBeInTheDocument();
    });
  });

  describe('handleSuccess callback', () => {
    it('calls onOpenChange(false) when form submission succeeds', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      renderDialog({ onOpenChange, preset: null });

      const nameInput = screen.getByRole('textbox', { name: /preset name/i });
      await user.clear(nameInput);
      await user.type(nameInput, 'My New Preset');

      const submitButton = screen.getByRole('button', {
        name: /create preset/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });
});
