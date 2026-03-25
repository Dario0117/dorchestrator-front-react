import {
  BottomNavBar,
  BottomNavBarButton,
  BottomNavBarItem,
} from '@components/ds/atoms/bottom-nav-bar';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('BottomNavBar', () => {
  it('renders children', () => {
    renderWithProviders(
      <BottomNavBar>
        <span>Child</span>
      </BottomNavBar>,
    );
    expect(screen.getByText('Child')).toBeInTheDocument();
  });

  it('renders as a nav element', () => {
    renderWithProviders(
      <BottomNavBar aria-label="Test Nav">
        <span>Item</span>
      </BottomNavBar>,
    );
    expect(screen.getByLabelText('Test Nav').tagName).toBe('NAV');
  });

  it('renders when hidden is false', () => {
    renderWithProviders(
      <BottomNavBar
        hidden={false}
        aria-label="Visible Nav"
      >
        <span>Visible</span>
      </BottomNavBar>,
    );
    expect(screen.getByLabelText('Visible Nav')).toBeInTheDocument();
  });

  it('renders with hidden prop set to true', () => {
    renderWithProviders(
      <BottomNavBar
        hidden
        aria-label="Hidden Nav"
      >
        <span>Hidden</span>
      </BottomNavBar>,
    );
    expect(screen.getByLabelText('Hidden Nav')).toBeInTheDocument();
  });
});

describe('BottomNavBarItem', () => {
  it('renders children', () => {
    renderWithProviders(<BottomNavBarItem>Item Text</BottomNavBarItem>);
    expect(screen.getByText('Item Text')).toBeInTheDocument();
  });

  it('renders with active state', () => {
    renderWithProviders(
      <BottomNavBarItem active>Active Item</BottomNavBarItem>,
    );
    expect(screen.getByText('Active Item')).toBeInTheDocument();
  });

  it('renders with inactive state', () => {
    renderWithProviders(
      <BottomNavBarItem active={false}>Inactive Item</BottomNavBarItem>,
    );
    expect(screen.getByText('Inactive Item')).toBeInTheDocument();
  });
});

describe('BottomNavBarButton', () => {
  it('renders children and handles click', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithProviders(
      <BottomNavBarButton onClick={onClick}>Click Me</BottomNavBarButton>,
    );
    await user.click(screen.getByText('Click Me'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
