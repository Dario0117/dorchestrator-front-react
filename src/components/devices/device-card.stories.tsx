import { DeviceCard } from '@components/devices/device-card';
import type { ListDevicesDevice } from '@services/devices/list-devices.http-service';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Devices/DeviceCard',
  component: DeviceCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Card component for displaying device information with status indicators and action buttons.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DeviceCard>;

export default meta;

type Story = StoryObj<typeof meta>;

const onlineDevice: ListDevicesDevice = {
  id: 1,
  deviceName: 'MacBook Pro',
  platform: 'macos',
  lastSeenAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

const offlineDevice: ListDevicesDevice = {
  id: 2,
  deviceName: 'Ubuntu Server',
  platform: 'linux',
  lastSeenAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
  createdAt: new Date().toISOString(),
};

const neverConnectedDevice: ListDevicesDevice = {
  id: 3,
  deviceName: 'Windows Desktop',
  platform: 'windows',
  lastSeenAt: null,
  createdAt: new Date().toISOString(),
};

const recentlySeenDevice: ListDevicesDevice = {
  id: 4,
  deviceName: 'Development Laptop',
  platform: 'linux',
  lastSeenAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
  createdAt: new Date().toISOString(),
};

export const Online: Story = {
  args: {
    device: onlineDevice,
    onRemove: (deviceId) => {
      console.log('Remove device:', deviceId);
    },
    onExecuteCommand: (deviceId) => {
      console.log('Execute command on device:', deviceId);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Device that was last seen less than 30 seconds ago (Online).',
      },
    },
  },
};

export const Offline: Story = {
  args: {
    device: offlineDevice,
    onRemove: (deviceId) => {
      console.log('Remove device:', deviceId);
    },
    onExecuteCommand: (deviceId) => {
      console.log('Execute command on device:', deviceId);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Device that was last seen more than 30 seconds ago (Offline).',
      },
    },
  },
};

export const NeverConnected: Story = {
  args: {
    device: neverConnectedDevice,
    onRemove: (deviceId) => {
      console.log('Remove device:', deviceId);
    },
    onExecuteCommand: (deviceId) => {
      console.log('Execute command on device:', deviceId);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Device that has never connected to the system.',
      },
    },
  },
};

export const RecentlySeen: Story = {
  args: {
    device: recentlySeenDevice,
    onRemove: (deviceId) => {
      console.log('Remove device:', deviceId);
    },
    onExecuteCommand: (deviceId) => {
      console.log('Execute command on device:', deviceId);
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Device that was recently seen (15 minutes ago), showing relative time format.',
      },
    },
  },
};

export const MacOS: Story = {
  args: {
    device: {
      ...onlineDevice,
      platform: 'macos',
      deviceName: 'MacBook Pro',
    },
    onRemove: (deviceId) => {
      console.log('Remove device:', deviceId);
    },
    onExecuteCommand: (deviceId) => {
      console.log('Execute command on device:', deviceId);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Device running macOS platform.',
      },
    },
  },
};

export const Linux: Story = {
  args: {
    device: {
      ...onlineDevice,
      platform: 'linux',
      deviceName: 'Ubuntu Server',
    },
    onRemove: (deviceId) => {
      console.log('Remove device:', deviceId);
    },
    onExecuteCommand: (deviceId) => {
      console.log('Execute command on device:', deviceId);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Device running Linux platform.',
      },
    },
  },
};

export const Windows: Story = {
  args: {
    device: {
      ...onlineDevice,
      platform: 'windows',
      deviceName: 'Windows Desktop',
    },
    onRemove: (deviceId) => {
      console.log('Remove device:', deviceId);
    },
    onExecuteCommand: (deviceId) => {
      console.log('Execute command on device:', deviceId);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Device running Windows platform.',
      },
    },
  },
};

export const Interactive: Story = {
  args: {
    device: onlineDevice,
    onRemove: (deviceId) => console.log('Remove device:', deviceId),
    onExecuteCommand: (deviceId) => console.log('Execute command:', deviceId),
  },
  render: () => {
    const devices: ListDevicesDevice[] = [
      onlineDevice,
      offlineDevice,
      neverConnectedDevice,
    ];

    return (
      <div className="flex flex-col gap-4">
        {devices.map((device) => (
          <DeviceCard
            key={device.id}
            device={device}
            onRemove={(deviceId) => {
              console.log('Remove device:', deviceId);
            }}
            onExecuteCommand={(deviceId) => {
              console.log('Execute command on device:', deviceId);
            }}
          />
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple device cards showing different states.',
      },
    },
  },
};
