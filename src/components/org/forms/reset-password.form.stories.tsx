import type { Meta, StoryObj } from '@storybook/react-vite';
import type { useResetPasswordMutationType } from '@/services/users/reset-password.http-service';
import { ResetPasswordForm } from './reset-password.form';

// Mock handlers for Storybook
const mockHandleResetSuccess = async (email: string) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1200));

  console.log('Reset password request:', { email });
  return { responseData: [] };
};

const mockHandleResetEmailNotFound = async (email: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log('Reset password request with email not found:', { email });
  const error = new Error('Email not found');
  Object.assign(error, {
    responseErrors: {
      nonFieldErrors: [
        'No account found with this email address. Please check your email and try again.',
      ],
    },
  });
  throw error;
};

const mockHandleResetRateLimited = async (email: string) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log('Reset password request with rate limit:', { email });
  const error = new Error('Rate limited');
  Object.assign(error, {
    responseErrors: {
      nonFieldErrors: [
        'Too many reset attempts. Please wait 15 minutes before trying again.',
      ],
    },
  });
  throw error;
};

const mockHandleSuccess = () => {
  console.log('Reset email sent successfully!');
};

const meta = {
  title: 'Forms/ResetPasswordForm',
  component: ResetPasswordForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Password reset form that allows users to request a password reset email.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ResetPasswordForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    resetPasswordMutation: {
      mutateAsync: async ({ body }: { body: { email: string } }) =>
        mockHandleResetSuccess(body.email),
      error: null,
    } as unknown as useResetPasswordMutationType,
    handleSuccess: mockHandleSuccess,
  },
};

export const EmailNotFound: Story = {
  args: {
    resetPasswordMutation: {
      mutateAsync: async ({ body }: { body: { email: string } }) =>
        mockHandleResetEmailNotFound(body.email),
      error: null,
    } as unknown as useResetPasswordMutationType,
    handleSuccess: mockHandleSuccess,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Password reset form showing error when email is not found in the system.',
      },
    },
  },
};

export const RateLimited: Story = {
  args: {
    resetPasswordMutation: {
      mutateAsync: async ({ body }: { body: { email: string } }) =>
        mockHandleResetRateLimited(body.email),
      error: null,
    } as unknown as useResetPasswordMutationType,
    handleSuccess: mockHandleSuccess,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Password reset form showing rate limiting error when too many requests are made.',
      },
    },
  },
};

export const Interactive: Story = {
  args: {
    resetPasswordMutation: {
      mutateAsync: async ({ body }: { body: { email: string } }) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const email = body.email;

        // Simulate different responses based on email
        if (email === 'notfound@example.com') {
          return mockHandleResetEmailNotFound(email);
        }

        if (email === 'ratelimit@example.com') {
          return mockHandleResetRateLimited(email);
        }

        return mockHandleResetSuccess(email);
      },
      error: null,
    } as unknown as useResetPasswordMutationType,
    handleSuccess: mockHandleSuccess,
  },
  parameters: {
    docs: {
      description: {
        story: `Interactive password reset form with different behaviors:
        - "notfound@example.com" will show email not found error
        - "ratelimit@example.com" will show rate limit error
        - Invalid email format will show validation error
        - Other valid emails will succeed`,
      },
    },
  },
};
