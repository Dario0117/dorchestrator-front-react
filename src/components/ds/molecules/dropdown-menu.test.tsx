import { clickTrigger } from '@lib/test-wrappers.utils';
import { render, screen } from '@testing-library/react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu';

describe('DropdownMenu', () => {
  describe('rendering', () => {
    it('renders trigger', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Options</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByText('Options')).toBeInTheDocument();
    });

    it('does not show content when closed', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Options</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('shows content when trigger is clicked', async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Options</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await clickTrigger(screen.getByText('Options'));
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  describe('semantic props', () => {
    it('accepts variant and inset on DropdownMenuItem', async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Options</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              variant="destructive"
              inset
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await clickTrigger(screen.getByText('Options'));
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('accepts inset on DropdownMenuLabel', async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Options</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel inset>Section</DropdownMenuLabel>
              <DropdownMenuItem>Item</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await clickTrigger(screen.getByText('Options'));
      expect(screen.getByText('Section')).toBeInTheDocument();
    });
  });

  describe('DropdownMenuPortal', () => {
    it('renders content through a portal', async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Options</DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent>
              <DropdownMenuItem>Portal Item</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>,
      );

      await clickTrigger(screen.getByText('Options'));
      expect(screen.getByText('Portal Item')).toBeInTheDocument();
    });
  });

  describe('DropdownMenuCheckboxItem', () => {
    it('renders a checkbox item with checked state', async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Options</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked>
              Show Sidebar
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await clickTrigger(screen.getByText('Options'));
      expect(screen.getByText('Show Sidebar')).toBeInTheDocument();
    });
  });

  describe('DropdownMenuSub', () => {
    it('renders a submenu with trigger and content', async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Options</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Sub Item</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      await clickTrigger(screen.getByText('Options'));
      expect(screen.getByText('More')).toBeInTheDocument();
    });
  });
});
