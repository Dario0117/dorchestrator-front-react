import type { Meta, StoryObj } from '@storybook/react-vite';
import type { useUpdatePasswordMutationType } from '@/services/users/update-password.http-service';
import { UpdatePasswordForm } from './update-password.form';

// Mock handlers for Storybook
const mockHandleUpdateSuccess = async (password: string, confirm: string) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log('Update password request:', { password, confirm });
  return { responseData: ['Password updated successfully'] };
};

const mockHandleUpdateError = async (password: string, confirm: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log('Update password request with error:', { password, confirm });
  const error = new Error('Invalid token or expired link');
  Object.assign(error, {
    responseErrors: {
      nonFieldErrors: [
        'This password reset link is invalid or has expired. Please request a new one.',
      ],
    },
  });
  throw error;
};

const mockHandleUpdateWeakPassword = async (
  password: string,
  confirm: string,
) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log('Update password request with weak password:', {
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
  console.log('Password updated successfully!');
};

const meta = {
  title: 'Forms/UpdatePasswordForm',
  component: UpdatePasswordForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Password update form for users who are resetting their password via email link.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UpdatePasswordForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    updatePasswordMutation: {
      mutateAsync: async ({
        body,
      }: {
        body: { password: string; confirm: string };
      }) => mockHandleUpdateSuccess(body.password, body.confirm),
      error: null,
    } as unknown as useUpdatePasswordMutationType,
    handleSuccess: mockHandleSuccess,
  },
};

export const InvalidToken: Story = {
  args: {
    updatePasswordMutation: {
      mutateAsync: async ({
        body,
      }: {
        body: { password: string; confirm: string };
      }) => mockHandleUpdateError(body.password, body.confirm),
      error: null,
    } as unknown as useUpdatePasswordMutationType,
    handleSuccess: mockHandleSuccess,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Password update form showing error when reset token is invalid or expired.',
      },
    },
  },
};

export const WeakPassword: Story = {
  args: {
    updatePasswordMutation: {
      mutateAsync: async ({
        body,
      }: {
        body: { password: string; confirm: string };
      }) => mockHandleUpdateWeakPassword(body.password, body.confirm),
      error: null,
    } as unknown as useUpdatePasswordMutationType,
    handleSuccess: mockHandleSuccess,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Password update form showing error when password does not meet security requirements.',
      },
    },
  },
};

export const Interactive: Story = {
  args: {
    updatePasswordMutation: {
      mutateAsync: async ({
        body,
      }: {
        body: { password: string; confirm: string };
      }) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const password = body.password;

        // Simulate different responses based on password
        if (password === 'weak') {
          return mockHandleUpdateWeakPassword(body.password, body.confirm);
        }

        if (password === 'invalid-token') {
          return mockHandleUpdateError(body.password, body.confirm);
        }

        return mockHandleUpdateSuccess(body.password, body.confirm);
      },
      error: null,
    } as unknown as useUpdatePasswordMutationType,
    handleSuccess: mockHandleSuccess,
  },
  parameters: {
    docs: {
      description: {
        story: `Interactive password update form with different behaviors:
        - "weak" as password will show weak password error
        - "invalid-token" as password will show invalid token error
        - Mismatched passwords will show validation error
        - Other valid passwords will succeed`,
      },
    },
  },
};
