import { RegisterForm } from '@components/org/forms/register.form';
import type { useRegisterMutationType } from '@services/users/register.http-service';
import type { Meta, StoryObj } from '@storybook/react-vite';

// Mock handlers for Storybook
const mockHandleRegisterSuccess = async (
  username: string,
  email: string,
  password: string,
  confirm: string,
) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log('Register attempt:', { username, email, password, confirm });
  return {
    responseData: ['Account created successfully!'],
    responseErrors: null,
  };
};

const mockHandleRegisterConflict = async (
  username: string,
  email: string,
  password: string,
  confirm: string,
) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log('Register attempt with conflict:', {
    username,
    email,
    password,
    confirm,
  });
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
  username: string,
  email: string,
  password: string,
  confirm: string,
) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log('Register attempt with weak password:', {
    username,
    email,
    password,
    confirm,
  });
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
    registerMutation: {
      mutateAsync: async ({
        body,
      }: {
        body: {
          username: string;
          email: string;
          password: string;
          confirm: string;
        };
      }) =>
        mockHandleRegisterSuccess(
          body.username,
          body.email,
          body.password,
          body.confirm,
        ),
      error: null,
    } as unknown as useRegisterMutationType,
    handleSuccess: mockHandleSuccess,
  },
};

export const UsernameConflict: Story = {
  args: {
    registerMutation: {
      mutateAsync: async ({
        body,
      }: {
        body: {
          username: string;
          email: string;
          password: string;
          confirm: string;
        };
      }) =>
        mockHandleRegisterConflict(
          body.username,
          body.email,
          body.password,
          body.confirm,
        ),
      error: null,
    } as unknown as useRegisterMutationType,
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
    registerMutation: {
      mutateAsync: async ({
        body,
      }: {
        body: {
          username: string;
          email: string;
          password: string;
          confirm: string;
        };
      }) =>
        mockHandleRegisterWeakPassword(
          body.username,
          body.email,
          body.password,
          body.confirm,
        ),
      error: null,
    } as unknown as useRegisterMutationType,
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
      mutateAsync: async ({
        body,
      }: {
        body: {
          username: string;
          email: string;
          password: string;
          confirm: string;
        };
      }) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Simulate different responses based on credentials
        if (body.username === 'admin' || body.email === 'admin@example.com') {
          return mockHandleRegisterConflict(
            body.username,
            body.email,
            body.password,
            body.confirm,
          );
        }

        if (body.password === 'weak') {
          return mockHandleRegisterWeakPassword(
            body.username,
            body.email,
            body.password,
            body.confirm,
          );
        }

        return mockHandleRegisterSuccess(
          body.username,
          body.email,
          body.password,
          body.confirm,
        );
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
