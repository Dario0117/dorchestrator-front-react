import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@components/ui/command';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {
      // Mock implementation
    }
    unobserve() {
      // Mock implementation
    }
    disconnect() {
      // Mock implementation
    }
  };

  Element.prototype.scrollIntoView = vi.fn();
});

describe('Command', () => {
  it('should render command component', () => {
    render(<Command data-testid="command" />);
    expect(screen.getByTestId('command')).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    render(
      <Command
        className="custom-class"
        data-testid="command"
      />,
    );
    expect(screen.getByTestId('command')).toBeInTheDocument();
  });

  it('should render with data-slot attribute', () => {
    render(<Command data-testid="command" />);
    expect(screen.getByTestId('command')).toHaveAttribute(
      'data-slot',
      'command',
    );
  });
});

describe('CommandDialog', () => {
  it('should render command dialog when open', () => {
    render(
      <CommandDialog open={true}>
        <CommandInput placeholder="Search..." />
      </CommandDialog>,
    );
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('should render with default title and description', () => {
    render(
      <CommandDialog open={true}>
        <CommandInput />
      </CommandDialog>,
    );
    expect(screen.getByText('Command Palette')).toBeInTheDocument();
    expect(
      screen.getByText('Search for a command to run...'),
    ).toBeInTheDocument();
  });

  it('should render with custom title and description', () => {
    render(
      <CommandDialog
        open={true}
        title="Custom Title"
        description="Custom description"
      >
        <CommandInput />
      </CommandDialog>,
    );
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom description')).toBeInTheDocument();
  });

  it('should hide close button when showCloseButton is false', () => {
    render(
      <CommandDialog
        open={true}
        showCloseButton={false}
      >
        <CommandInput />
      </CommandDialog>,
    );
    expect(
      screen.queryByRole('button', { name: /close/i }),
    ).not.toBeInTheDocument();
  });
});

describe('CommandInput', () => {
  it('should render command input', () => {
    render(
      <Command>
        <CommandInput placeholder="Type a command..." />
      </Command>,
    );
    expect(
      screen.getByPlaceholderText('Type a command...'),
    ).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    render(
      <Command>
        <CommandInput
          className="custom-input"
          placeholder="Search"
        />
      </Command>,
    );
    const input = screen.getByPlaceholderText('Search');
    expect(input).toBeInTheDocument();
  });
});

describe('CommandList', () => {
  it('should render command list with items', () => {
    render(
      <Command>
        <CommandList>
          <CommandItem>Item 1</CommandItem>
          <CommandItem>Item 2</CommandItem>
        </CommandList>
      </Command>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });
});

describe('CommandEmpty', () => {
  it('should render empty state', () => {
    render(
      <Command>
        <CommandList>
          <CommandEmpty>No results found</CommandEmpty>
        </CommandList>
      </Command>,
    );
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });
});

describe('CommandGroup', () => {
  it('should render command group with items', () => {
    render(
      <Command>
        <CommandList>
          <CommandGroup heading="Group 1">
            <CommandItem>Item 1</CommandItem>
            <CommandItem>Item 2</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    expect(screen.getByText('Group 1')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });
});

describe('CommandSeparator', () => {
  it('should render command separator', () => {
    render(
      <Command>
        <CommandList>
          <CommandGroup>
            <CommandItem>Item 1</CommandItem>
          </CommandGroup>
          <CommandSeparator data-testid="separator" />
          <CommandGroup>
            <CommandItem>Item 2</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    expect(screen.getByTestId('separator')).toBeInTheDocument();
  });
});

describe('CommandItem', () => {
  it('should render command item', () => {
    render(
      <Command>
        <CommandList>
          <CommandItem>Test item</CommandItem>
        </CommandList>
      </Command>,
    );
    expect(screen.getByText('Test item')).toBeInTheDocument();
  });

  it('should call onSelect when item is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Command>
        <CommandList>
          <CommandItem onSelect={onSelect}>Click me</CommandItem>
        </CommandList>
      </Command>,
    );
    await user.click(screen.getByText('Click me'));
    expect(onSelect).toHaveBeenCalled();
  });

  it('should render with custom className', () => {
    render(
      <Command>
        <CommandList>
          <CommandItem className="custom-item">Item</CommandItem>
        </CommandList>
      </Command>,
    );
    expect(screen.getByText('Item')).toBeInTheDocument();
  });
});

describe('CommandShortcut', () => {
  it('should render command shortcut', () => {
    render(
      <Command>
        <CommandList>
          <CommandItem>
            Open
            <CommandShortcut>⌘K</CommandShortcut>
          </CommandItem>
        </CommandList>
      </Command>,
    );
    expect(screen.getByText('⌘K')).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    render(
      <Command>
        <CommandList>
          <CommandItem>
            Open
            <CommandShortcut className="custom-shortcut">⌘K</CommandShortcut>
          </CommandItem>
        </CommandList>
      </Command>,
    );
    expect(screen.getByText('⌘K')).toBeInTheDocument();
  });
});
