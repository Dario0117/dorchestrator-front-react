import { CreateOrganizationForm } from '@components/org/forms/create-organization.form';
import * as loggerUtils from '@lib/logger.utils';
import { buildBackendUrl } from '@lib/test.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { useCreateOrganizationMutation } from '@services/organizations/create-organization.http-service';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '@/../testsSetup';

// The OpenAPI schema doesn't define a 200 response for this endpoint,
// but the actual API returns { status: true } on success
type CheckSlugSuccessResponse = {
  status: boolean;
};

function TestWrapper({ handleSuccess }: { handleSuccess: () => void }) {
  const createOrganizationMutation = useCreateOrganizationMutation();
  return (
    <CreateOrganizationForm
      createOrganizationMutation={createOrganizationMutation}
      handleSuccess={handleSuccess}
    />
  );
}

describe('CreateOrganizationForm', () => {
  const mockHandleSuccess = vi.fn();

  beforeEach(() => {
    mockHandleSuccess.mockClear();
  });

  it('should render the form with all required fields', () => {
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    expect(screen.getByText('Create Your Organization')).toBeInTheDocument();
    expect(screen.getByLabelText(/Organization Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Organization Slug/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Create Organization' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Check Availability' }),
    ).toBeInTheDocument();
  });

  it('should display logo preview with question mark initially', () => {
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('should update logo initials when organization name is entered', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const nameInput = screen.getByLabelText(/Organization Name/);
    await user.type(nameInput, 'Acme Corporation');

    await waitFor(() => {
      expect(screen.getByText('AC')).toBeInTheDocument();
    });
  });

  it('should auto-generate slug from organization name', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const nameInput = screen.getByLabelText(/Organization Name/);
    const slugInput = screen.getByLabelText(/Organization Slug/);

    await user.type(nameInput, 'Acme Corporation');

    await waitFor(() => {
      expect(slugInput).toHaveValue('acme-corporation');
    });
  });

  it('should reset slug validation status when slug input changes', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const slugInput = screen.getByLabelText(/Organization Slug/);
    await user.type(slugInput, 'custom-slug');

    const checkButton = screen.getByRole('button', {
      name: 'Check Availability',
    });

    // Check button should be enabled when there's a slug value
    await waitFor(() => {
      expect(checkButton).toBeEnabled();
    });
  });

  it('should check slug availability when Check Availability is clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const slugInput = screen.getByLabelText(/Organization Slug/);
    await user.type(slugInput, 'available-slug');

    const checkButton = screen.getByRole('button', {
      name: 'Check Availability',
    });
    await user.click(checkButton);

    // Should show success message when slug is available
    await waitFor(() => {
      expect(screen.getByText('✓ Slug is available')).toBeInTheDocument();
    });
  });

  it('should disable Check Availability button when checking', async () => {
    const user = userEvent.setup();

    // Add delay to the check-slug endpoint to test the checking state
    server.use(
      http.post<never, never, CheckSlugSuccessResponse>(
        buildBackendUrl('/api/v1/organization/check-slug'),
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json({ status: true });
        },
      ),
    );

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const slugInput = screen.getByLabelText(/Organization Slug/);
    await user.type(slugInput, 'test-slug');

    const checkButton = screen.getByRole('button', {
      name: 'Check Availability',
    });
    await user.click(checkButton);

    // Should show checking state
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Checking...' }),
      ).toBeDisabled();
    });
  });

  it('should show success message when slug is available', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const slugInput = screen.getByLabelText(/Organization Slug/);
    await user.type(slugInput, 'available-slug');

    const checkButton = screen.getByRole('button', {
      name: 'Check Availability',
    });
    await user.click(checkButton);

    await waitFor(() => {
      expect(screen.getByText('✓ Slug is available')).toBeInTheDocument();
    });
  });

  it('should show error message when slug is taken', async () => {
    vi.spyOn(loggerUtils, 'logError').mockImplementation(vi.fn());
    const user = userEvent.setup();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const slugInput = screen.getByLabelText(/Organization Slug/);
    // Use 'taken' in the slug to trigger the mock handler to return 409
    await user.type(slugInput, 'slug-taken');

    const checkButton = screen.getByRole('button', {
      name: 'Check Availability',
    });
    await user.click(checkButton);

    await waitFor(() => {
      expect(screen.getByText('✗ Slug is already taken')).toBeInTheDocument();
    });
  });

  it('should disable submit button when slug is not valid', () => {
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const submitButton = screen.getByRole('button', {
      name: 'Create Organization',
    });
    // Submit button should be disabled when slug hasn't been validated
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when slug is valid', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const nameInput = screen.getByLabelText(/Organization Name/);
    const slugInput = screen.getByLabelText(/Organization Slug/);

    await user.type(nameInput, 'Test Organization');
    await user.type(slugInput, 'valid-slug');

    const checkButton = screen.getByRole('button', {
      name: 'Check Availability',
    });
    await user.click(checkButton);

    // Wait for slug to be validated
    await waitFor(() => {
      expect(screen.getByText('✓ Slug is available')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', {
      name: 'Create Organization',
    });
    // Submit button should be enabled when slug is valid and form is filled
    expect(submitButton).toBeEnabled();
  });

  it('should have required attributes on form fields', () => {
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const nameInput = screen.getByLabelText(/Organization Name/);
    const slugInput = screen.getByLabelText(/Organization Slug/);

    expect(nameInput).toHaveAttribute('required');
    expect(slugInput).toHaveAttribute('required');
  });

  it('should display helper text for slug input', () => {
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    expect(
      screen.getByText(
        /Used in URLs. Only lowercase letters, numbers, and hyphens./,
      ),
    ).toBeInTheDocument();
  });

  it('should submit the form when all fields are valid and slug is verified', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const nameInput = screen.getByLabelText(/Organization Name/);
    const slugInput = screen.getByLabelText(/Organization Slug/);

    await user.type(nameInput, 'Test Organization');
    await user.type(slugInput, 'valid-slug');

    const checkButton = screen.getByRole('button', {
      name: 'Check Availability',
    });
    await user.click(checkButton);

    await waitFor(() => {
      expect(screen.getByText('✓ Slug is available')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', {
      name: 'Create Organization',
    });
    expect(submitButton).toBeEnabled();
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockHandleSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('should not update slug when name is cleared', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const nameInput = screen.getByLabelText(/Organization Name/);
    const slugInput = screen.getByLabelText(
      /Organization Slug/,
    ) as HTMLInputElement;

    // Type a name first to generate a slug
    await user.type(nameInput, 'Acme Corporation');
    await waitFor(() => {
      expect(slugInput.value).toBe('acme-corporation');
    });

    // Clear the name field - should not clear the slug since slugSuggestion is empty
    await user.clear(nameInput);

    // Slug should remain since generateSlugSuggestion returns empty for empty input
    await waitFor(() => {
      expect(slugInput.value).toBe('acme-corporation');
    });
  });

  it('should disable Check Availability button when slug is empty', () => {
    renderWithProviders(<TestWrapper handleSuccess={mockHandleSuccess} />);

    const checkButton = screen.getByRole('button', {
      name: 'Check Availability',
    });

    expect(checkButton).toBeDisabled();
  });
});
