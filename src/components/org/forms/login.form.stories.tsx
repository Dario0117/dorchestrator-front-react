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

// Mock handlers for Storybook
const mockHandleLoginSuccess = async (email: string, password: string) => {
  // Simulate API delay
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

const mockHandleLoginError = async (email: string, password: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log('Login attempt with error:', { email, password });
  throw new Error(
    'Invalid email or password. Please check your credentials and try again.',
  );
};

const mockHandleLoginNetworkError = async (email: string, password: string) => {
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
    loginMutation: {
      mutateAsync: async ({
        email,
        password,
      }: {
        email: string;
        password: string;
      }) => mockHandleLoginSuccess(email, password),
      error: null,
    } as useLoginMutationType,
    handleSuccess: (data) => {
      console.log('Login successful:', data);
    },
  },
};

export const WithError: Story = {
  args: {
    loginMutation: {
      mutateAsync: async ({
        email,
        password,
      }: {
        email: string;
        password: string;
      }) => mockHandleLoginError(email, password),
      error: null,
    } as unknown as useLoginMutationType,
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
      mutateAsync: async ({
        email,
        password,
      }: {
        email: string;
        password: string;
      }) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Simulate different responses based on credentials
        if (email === 'admin@example.com' && password === 'password') {
          return mockHandleLoginSuccess(email, password);
        }

        if (email === 'network-error@example.com') {
          return mockHandleLoginNetworkError(email, password);
        }

        return mockHandleLoginError(email, password);
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
