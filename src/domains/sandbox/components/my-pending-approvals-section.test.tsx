import { MyPendingApprovalsSection } from '@domains/sandbox/components/my-pending-approvals-section';
import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { Suspense } from 'react';
import { server } from '@/../testsSetup';

const approvalEndpoint = buildBackendUrl(
  '/api/v1/{organizationId}/teams/{teamId}/sandbox/approval-requests/mine',
);

function makeApproval(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    deviceId: 1,
    userId: 'user-1',
    requestType: 'terminal',
    requestedConfig: {
      presetId: 2,
      presetName: 'Restricted Docker',
      sandboxTypeId: 2,
      category: 'container',
      networkPolicy: null,
      resourceLimits: null,
      volumeMounts: null,
      providerConfig: null,
    },
    effectiveConfigAtRequest: {
      presetId: 1,
      presetName: 'Default Docker',
      sandboxTypeId: 2,
      category: 'container',
      networkPolicy: { mode: 'allow-all' },
      resourceLimits: null,
      volumeMounts: null,
      providerConfig: null,
    },
    requestedPresetId: 2,
    effectivePresetId: 1,
    status: 'pending',
    expiresAt: '2026-05-01T00:00:00.000Z',
    reviewedBy: null,
    reviewedAt: null,
    createdAt: '2026-04-01T00:00:00.000Z',
    ...overrides,
  };
}

function useHandler(results: unknown[]) {
  server.use(
    http.get(approvalEndpoint, () =>
      HttpResponse.json({
        responseData: {
          results,
          hasNext: false,
          hasPrevious: false,
          totalResults: results.length,
          totalPages: 1,
          page: 1,
          size: 20,
        },
        responseErrors: null,
      }),
    ),
  );
}

function useNullResponseDataHandler() {
  server.use(
    http.get(approvalEndpoint, () =>
      HttpResponse.json({
        responseData: null,
        responseErrors: null,
      }),
    ),
  );
}

function renderSection() {
  return renderWithProviders(
    <Suspense fallback={<div>Loading...</div>}>
      <MyPendingApprovalsSection
        organizationId="org-1"
        teamId="team-1"
      />
    </Suspense>,
  );
}

describe('MyPendingApprovalsSection', () => {
  it('renders pending approvals with terminal request type and preset name', async () => {
    useHandler([makeApproval()]);
    renderSection();
    await waitFor(() => {
      expect(screen.getByText('Pending Sandbox Approvals')).toBeInTheDocument();
    });
    expect(
      screen.getByText(/Terminal override request - Restricted Docker/),
    ).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText(/Expires:/)).toBeInTheDocument();
    expect(screen.getByText(/Requested:/)).toBeInTheDocument();
  });

  it('renders nothing when there are no pending approvals', async () => {
    useHandler([]);
    const { container } = renderSection();
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    expect(container.innerHTML).toBe('');
  });

  it('filters out non-pending approvals and renders nothing', async () => {
    useHandler([makeApproval({ status: 'approved' })]);
    const { container } = renderSection();
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    expect(container.innerHTML).toBe('');
  });

  it('renders "Command" for non-terminal request type', async () => {
    useHandler([makeApproval({ requestType: 'command' })]);
    renderSection();
    await waitFor(() => {
      expect(screen.getByText(/Command override request/)).toBeInTheDocument();
    });
  });

  it('renders without preset name when presetName is absent', async () => {
    useHandler([
      makeApproval({
        requestedConfig: {
          presetId: null,
          presetName: null,
          sandboxTypeId: 2,
          category: 'container',
          networkPolicy: null,
          resourceLimits: null,
          volumeMounts: null,
          providerConfig: null,
        },
      }),
    ]);
    renderSection();
    await waitFor(() => {
      expect(screen.getByText('Pending Sandbox Approvals')).toBeInTheDocument();
    });
    expect(screen.getByText(/Terminal override request$/)).toBeInTheDocument();
    expect(screen.queryByText(/-/)).not.toBeInTheDocument();
  });

  it('renders nothing when responseData is null', async () => {
    useNullResponseDataHandler();
    const { container } = renderSection();
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    expect(container.innerHTML).toBe('');
  });
});
