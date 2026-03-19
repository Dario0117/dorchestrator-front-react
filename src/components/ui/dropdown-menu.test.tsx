import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { clickTrigger } from '@lib/test-wrappers.utils';
import { render, screen } from '@testing-library/react';

describe('DropdownMenu', () => {
  it('should render trigger and content', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const trigger = screen.getByText('Open Menu');
    expect(trigger).toBeInTheDocument();

    await clickTrigger(trigger);

    expect(await screen.findByText('Item 1')).toBeInTheDocument();
  });

  it('should render menu items with default variant', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Default Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await clickTrigger(screen.getByText('Menu'));

    const item = await screen.findByText('Default Item');
    expect(item).toBeInTheDocument();
    expect(item).toHaveAttribute('data-variant', 'default');
  });

  it('should render menu items with destructive variant', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await clickTrigger(screen.getByText('Menu'));

    const item = await screen.findByText('Delete');
    expect(item).toBeInTheDocument();
    expect(item).toHaveAttribute('data-variant', 'destructive');
  });

  it('should render menu items with inset prop', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem inset>Inset Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await clickTrigger(screen.getByText('Menu'));

    const item = await screen.findByText('Inset Item');
    expect(item).toBeInTheDocument();
    expect(item).toHaveAttribute('data-inset', 'true');
  });

  it('should render checkbox items', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>
            Checked Item
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={false}>
            Unchecked Item
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await clickTrigger(screen.getByText('Menu'));

    expect(await screen.findByText('Checked Item')).toBeInTheDocument();
    expect(await screen.findByText('Unchecked Item')).toBeInTheDocument();
  });

  it('should render radio group with radio items', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="option1">
            <DropdownMenuRadioItem value="option1">
              Option 1
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="option2">
              Option 2
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await clickTrigger(screen.getByText('Menu'));

    expect(await screen.findByText('Option 1')).toBeInTheDocument();
    expect(await screen.findByText('Option 2')).toBeInTheDocument();
  });

  it('should render menu group', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem>Group Item 1</DropdownMenuItem>
            <DropdownMenuItem>Group Item 2</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await clickTrigger(screen.getByText('Menu'));

    expect(await screen.findByText('Group Item 1')).toBeInTheDocument();
    expect(await screen.findByText('Group Item 2')).toBeInTheDocument();
  });

  it('should render menu label', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Label Text</DropdownMenuLabel>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await clickTrigger(screen.getByText('Menu'));

    expect(await screen.findByText('Label Text')).toBeInTheDocument();
  });

  it('should render menu label with inset', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel inset>Inset Label</DropdownMenuLabel>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await clickTrigger(screen.getByText('Menu'));

    const label = await screen.findByText('Inset Label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('data-inset', 'true');
  });

  it('should render separator', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await clickTrigger(screen.getByText('Menu'));

    expect(await screen.findByText('Item 1')).toBeInTheDocument();
    expect(await screen.findByText('Item 2')).toBeInTheDocument();
  });

  it('should render submenu', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More Options</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Submenu Item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await clickTrigger(screen.getByText('Menu'));

    expect(await screen.findByText('More Options')).toBeInTheDocument();
  });

  it('should render submenu trigger with inset', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger inset>Inset Submenu</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Submenu Item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await clickTrigger(screen.getByText('Menu'));

    const trigger = await screen.findByText('Inset Submenu');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('data-inset', 'true');
  });

  it('should render portal', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuItem>Portal Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>,
    );

    await clickTrigger(screen.getByText('Menu'));

    expect(await screen.findByText('Portal Item')).toBeInTheDocument();
  });

  it('should render content with custom sideOffset', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={10}>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await clickTrigger(screen.getByText('Menu'));

    expect(await screen.findByText('Item')).toBeInTheDocument();
  });

  it('should handle click on menu item', async () => {
    const handleClick = vi.fn();

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleClick}>
            Clickable Item
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await clickTrigger(screen.getByText('Menu'));
    const item = await screen.findByText('Clickable Item');
    await clickTrigger(item);

    expect(handleClick).toHaveBeenCalled();
  });
});
