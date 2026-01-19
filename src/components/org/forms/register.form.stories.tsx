import { RegisterForm } from '@components/org/forms/register.form';
import type { useRegisterMutationType } from '@services/users/register.http-service';
import type { Meta, StoryObj } from '@storybook/react-vite';

interface RegisterBody {
  username: string;
  email: string;
  password: string;
  confirm: string;
}

// Helper to create mock mutation with success response
function createSuccessMutation(
  handler: (body: RegisterBody) => Promise<unknown>,
): useRegisterMutationType {
  return {
    mutate: (
      variables: { body: RegisterBody },
      options?: { onSuccess?: (data: unknown) => void; onError?: () => void },
    ) => {
      handler(variables.body)
        .then((result) => options?.onSuccess?.(result))
        .catch(() => options?.onError?.());
    },
    error: null,
  } as unknown as useRegisterMutationType;
}

// Helper to create mock mutation with error response
function createErrorMutation(
  handler: (body: RegisterBody) => Promise<never>,
): useRegisterMutationType {
  return {
    mutate: (
      variables: { body: RegisterBody },
      options?: { onSuccess?: () => void; onError?: (error: Error) => void },
    ) => {
      handler(variables.body).catch((error) => options?.onError?.(error));
    },
    error: null,
  } as unknown as useRegisterMutationType;
}

// Mock handlers for Storybook
const mockHandleRegisterSuccess = async (body: RegisterBody) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log('Register attempt:', body);
  return {
    responseData: ['Account created successfully!'],
    responseErrors: null,
  };
};

const mockHandleRegisterConflict = async (
  body: RegisterBody,
): Promise<never> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log('Register attempt with conflict:', body);
  const error = new Error('Username or email already exists');
  Object.assign(error, {
    responseErrors: {
      nonFieldErrors: [
        'An account with this username or email already exists. Please use a different one.',
      ],
    },
  });
  throw error;
};

const mockHandleRegisterWeakPassword = async (
  body: RegisterBody,
): Promise<never> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log('Register attempt with weak password:', body);
  const error = new Error('Weak password');
  Object.assign(error, {
    responseErrors: {
      password: [
        'Password is too weak. Please include uppercase, lowercase, numbers, and special characters.',
      ],
    },
  });
  throw error;
};

const mockHandleSuccess = () => {
  console.log('Registration successful! Redirecting...');
};

const meta = {
  title: 'Forms/RegisterForm',
  component: RegisterForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Registration form with username, email, password, and password confirmation fields.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RegisterForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    registerMutation: createSuccessMutation(mockHandleRegisterSuccess),
    handleSuccess: mockHandleSuccess,
  },
};

export const UsernameConflict: Story = {
  args: {
    registerMutation: createErrorMutation(mockHandleRegisterConflict),
    handleSuccess: mockHandleSuccess,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Registration form that shows server errors when username or email already exists.',
      },
    },
  },
};

export const WeakPassword: Story = {
  args: {
    registerMutation: createErrorMutation(mockHandleRegisterWeakPassword),
    handleSuccess: mockHandleSuccess,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Registration form showing error when password does not meet security requirements.',
      },
    },
  },
};

export const Interactive: Story = {
  args: {
    registerMutation: {
      mutate: (
        variables: { body: RegisterBody },
        options?: {
          onSuccess?: (data: unknown) => void;
          onError?: (error: Error) => void;
        },
      ) => {
        const body = variables.body;

        setTimeout(async () => {
          try {
            if (
              body.username === 'admin' ||
              body.email === 'admin@example.com'
            ) {
              await mockHandleRegisterConflict(body);
              return;
            }

            if (body.password === 'weak') {
              await mockHandleRegisterWeakPassword(body);
              return;
            }

            const result = await mockHandleRegisterSuccess(body);
            options?.onSuccess?.(result);
          } catch (error) {
            options?.onError?.(error as Error);
          }
        }, 0);
      },
      error: null,
    } as unknown as useRegisterMutationType,
    handleSuccess: mockHandleSuccess,
  },
  parameters: {
    docs: {
      description: {
        story: `Interactive registration form with different behaviors:
        - Username "admin" or email "admin@example.com" will show conflict error
        - Password "weak" will show weak password error
        - Short username (<3 chars), invalid email, or short password (<6 chars) will show validation errors
        - Mismatched passwords will show validation error
        - Other valid inputs will succeed`,
      },
    },
  },
};
