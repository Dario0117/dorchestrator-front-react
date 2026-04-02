import type { operations } from '@/types/api.generated.types';

// --- Network Policy Mode ---

type CreatePresetBody =
  operations['postApiV1ByOrganizationIdSandboxPresets']['requestBody']['content']['application/json'];

type NetworkPolicyFromApi = NonNullable<
  CreatePresetBody['networkPolicy']
>['mode'];

export const NETWORK_POLICY_MODES = [
  'allow-list',
  'deny-list',
  'allow-all',
  'internet-only',
  'local-only',
] as const satisfies readonly NetworkPolicyFromApi[];

export type NetworkPolicyMode = NetworkPolicyFromApi;

export const NETWORK_MODE_LABELS = {
  'allow-list': 'Allow List',
  'deny-list': 'Deny List',
  'allow-all': 'Allow All',
  'internet-only': 'Internet Only',
  'local-only': 'Local Only',
} as const satisfies Record<NetworkPolicyMode, string>;

// --- Approval Request Type ---

type RequestOverrideBody =
  operations['postApiV1ByOrganizationIdTeamsByTeamIdSandboxApproval-requests']['requestBody']['content']['application/json'];

type RequestTypeFromApi = RequestOverrideBody['requestType'];

export const APPROVAL_REQUEST_TYPES = [
  'command',
  'terminal',
] as const satisfies readonly RequestTypeFromApi[];

export type ApprovalRequestType = RequestTypeFromApi;

// --- Approval Decision ---

type ReviewApprovalBody =
  operations['patchApiV1ByOrganizationIdSandboxApproval-requestsByApprovalId']['requestBody']['content']['application/json'];

type ApprovalDecisionFromApi = ReviewApprovalBody['decision'];

export const APPROVAL_DECISIONS = [
  'approved',
  'rejected',
] as const satisfies readonly ApprovalDecisionFromApi[];

export type ApprovalDecision = ApprovalDecisionFromApi;

// --- Sandbox Category ---

type DeviceSandboxConfigResponse =
  operations['getApiV1ByOrganizationIdDevicesByDeviceIdSandboxConfig']['responses']['200']['content']['application/json'];

type DeviceSandboxConfigResults = NonNullable<
  DeviceSandboxConfigResponse['responseData']['results']
>;

export type SandboxCategory = DeviceSandboxConfigResults['category'];
