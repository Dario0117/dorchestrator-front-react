import { useLoginForm } from '@components/org/forms/hooks/use-login-form';
import type { LoginFormProps } from '@components/org/forms/login.form.types';
import { Button } from '@components/ui/button';
import { FormCard } from '@components/ui/form-card';
import { FormErrorDisplay } from '@components/ui/form-error-display';
import { FormField } from '@components/ui/form-field';
import type { useLoginMutationType } from '@services/users/login.http-service';
import type { Meta, StoryObj } from '@storybook/react-vite';

// Mock LoginForm component to avoid router context dependencies
function MockLoginForm({ loginMutation, handleSuccess }: LoginFormProps) {
  const form = useLoginForm({ loginMutation, handleSuccess });

  return (
    <FormCard
      title="Login to your account"
      description="Enter your email below to login to your account"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className="flex flex-col gap-6">
          <form.Field name="email">
            {(field) => (
              <FormField
                field={field}
                label="Email"
                placeholder="john@example.com"
                type="email"
                required
              />
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <FormField
                field={field}
                label="Password"
                type="password"
                placeholder="Password"
                required
              >
                <a
                  href="/reset-password"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </FormField>
            )}
          </form.Field>

          <div className="flex flex-col gap-3">
            <form.Subscribe
              selector={(state) => state.isValid && !state.isPristine}
            >
              {(canSubmit) => (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!canSubmit}
                >
                  Login
                </Button>
              )}
            </form.Subscribe>
          </div>
        </div>

        <form.Subscribe selector={(state) => [state.errorMap]}>
          {([errorMap]) => {
            const submitErrors = errorMap?.onSubmit;
            if (!submitErrors) {
              return null;
            }
            return <FormErrorDisplay errors={submitErrors} />;
          }}
        </form.Subscribe>

        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account? <a href="/register">Register</a>
        </div>
      </form>
    </FormCard>
  );
}

// Helper to create mock mutation with success response
function createSuccessMutation(
  handler: (
    email: string,
    password: string,
  ) => Promise<{ data: unknown; error: null }>,
): useLoginMutationType {
  return {
    mutate: (
      variables: { email: string; password: string },
      options?: { onSuccess?: (data: unknown) => void; onError?: () => void },
    ) => {
      handler(variables.email, variables.password)
        .then((result) => options?.onSuccess?.(result))
        .catch(() => options?.onError?.());
    },
    error: null,
  } as unknown as useLoginMutationType;
}

// Helper to create mock mutation with error response
function createErrorMutation(
  handler: (email: string, password: string) => Promise<never>,
): useLoginMutationType {
  return {
    mutate: (
      variables: { email: string; password: string },
      options?: { onSuccess?: () => void; onError?: (error: Error) => void },
    ) => {
      handler(variables.email, variables.password).catch((error) =>
        options?.onError?.(error),
      );
    },
    error: null,
  } as unknown as useLoginMutationType;
}

// Mock handlers for Storybook
const mockHandleLoginSuccess = async (email: string, password: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log('Login attempt:', { email, password });
  return {
    data: {
      redirect: false,
      token: 'mock-token-123',
      user: {
        id: 'mock-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        email,
        emailVerified: true,
        name: 'Mock User',
        image: null,
      },
    },
    error: null,
  };
};

const mockHandleLoginError = async (
  email: string,
  password: string,
): Promise<never> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log('Login attempt with error:', { email, password });
  throw new Error(
    'Invalid email or password. Please check your credentials and try again.',
  );
};

const mockHandleLoginNetworkError = async (
  email: string,
  password: string,
): Promise<never> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log('Login attempt with network error:', { email, password });
  throw new Error(
    'Network error. Please check your internet connection and try again.',
  );
};

const meta = {
  title: 'Forms/LoginForm',
  component: MockLoginForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Login form component with email/password fields and error handling.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MockLoginForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    loginMutation: createSuccessMutation(mockHandleLoginSuccess),
    handleSuccess: (data) => {
      console.log('Login successful:', data);
    },
  },
};

export const WithError: Story = {
  args: {
    loginMutation: createErrorMutation(mockHandleLoginError),
    handleSuccess: (data) => {
      console.log('Login successful:', data);
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Login form that displays an error message when authentication fails.',
      },
    },
  },
};

export const Interactive: Story = {
  args: {
    loginMutation: {
      mutate: (
        variables: { email: string; password: string },
        options?: {
          onSuccess?: (data: unknown) => void;
          onError?: (error: Error) => void;
        },
      ) => {
        const { email, password } = variables;

        setTimeout(async () => {
          try {
            if (email === 'admin@example.com' && password === 'password') {
              const result = await mockHandleLoginSuccess(email, password);
              options?.onSuccess?.(result);
            } else if (email === 'network-error@example.com') {
              await mockHandleLoginNetworkError(email, password);
            } else {
              await mockHandleLoginError(email, password);
            }
          } catch (error) {
            options?.onError?.(error as Error);
          }
        }, 0);
      },
      error: null,
    } as unknown as useLoginMutationType,
    handleSuccess: (data) => {
      console.log('Login successful:', data);
    },
  },
  parameters: {
    docs: {
      description: {
        story: `Interactive login form with different behaviors:
        - Use "admin@example.com" / "password" for successful login
        - Use "network-error@example.com" / any password for network error
        - Any other credentials will show invalid credentials error`,
      },
    },
  },
};
