import { FormCard } from '@components/ui/form-card';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  component: FormCard,
} satisfies Meta<typeof FormCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'title',
    description: 'description',
    children: <div>children</div>,
  },
};

export const Secondary: Story = {
  args: {
    title: 'title222',
    description: 'description',
    children: <div>children</div>,
  },
};
