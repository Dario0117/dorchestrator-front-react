import { SessionCheckMiddleware } from '@components/org/pages/session-check-middleware.page';
import { buildBackendUrl } from '@lib/test.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { useAuthenticationStore } from '@stores/authentication.store';
import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';

// Mock the navigation component
vi.mock('@tanstack/react-router', () => ({
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate">{to}</div>,
}));

describe('SessionCheckMiddleware', () => {
  beforeEach(() => {
    // Reset the store before each test
    useAuthenticationStore.setState({ profile: undefined });
  });

  describe('Loading state', () => {
    it('should render null when loading', () => {
      // Mock the get-session endpoint to delay response to simulate loading
      server.use(
        http.get(
          buildBackendUrl('/api/v1/get-session'),
          async () =>
            new Promise(() => {
              // Never resolves to keep loading state
            }),
        ),
      );

      const { container } = renderWithProviders(
        <SessionCheckMiddleware
          to="/login"
          whenProfileExist={false}
        >
          <div>Child Content</div>
        </SessionCheckMiddleware>,
      );

      // Initially should be loading (null)
      expect(container.firstChild).toBeNull();
      expect(screen.queryByText('Child Content')).not.toBeInTheDocument();
    });
  });

  describe('When profile exists - redirect scenario', () => {
    it('should redirect when profile exists and whenProfileExist is true', async () => {
      // Use default MSW handler which returns a profile
      renderWithProviders(
        <SessionCheckMiddleware
          to="/"
          whenProfileExist={true}
        >
          <div>Child Content</div>
        </SessionCheckMiddleware>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('navigate')).toHaveTextContent('/');
      });
      expect(screen.queryByText('Child Content')).not.toBeInTheDocument();
    });

    it('should render children when profile exists and whenProfileExist is false', async () => {
      // Use default MSW handler which returns a profile
      renderWithProviders(
        <SessionCheckMiddleware
          to="/login"
          whenProfileExist={false}
        >
          <div>Child Content</div>
        </SessionCheckMiddleware>,
      );

      await waitFor(() => {
        expect(screen.getByText('Child Content')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    });
  });

  describe('When profile does not exist - redirect scenario', () => {
    it('should redirect when profile does not exist and whenProfileExist is false', async () => {
      // Override MSW handler to return no user (unauthenticated)
      server.use(
        http.get(buildBackendUrl('/api/v1/get-session'), () => {
          return HttpResponse.json({ user: null, session: null });
        }),
      );

      renderWithProviders(
        <SessionCheckMiddleware
          to="/login"
          whenProfileExist={false}
        >
          <div>Child Content</div>
        </SessionCheckMiddleware>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('navigate')).toHaveTextContent('/login');
      });
      expect(screen.queryByText('Child Content')).not.toBeInTheDocument();
    });

    it('should render children when profile does not exist and whenProfileExist is true', async () => {
      // Override MSW handler to return no user (unauthenticated)
      server.use(
        http.get(buildBackendUrl('/api/v1/get-session'), () => {
          return HttpResponse.json({ user: null, session: null });
        }),
      );

      renderWithProviders(
        <SessionCheckMiddleware
          to="/"
          whenProfileExist={true}
        >
          <div>Child Content</div>
        </SessionCheckMiddleware>,
      );

      await waitFor(() => {
        expect(screen.getByText('Child Content')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    });
  });

  describe('Profile setting', () => {
    it('should update store profile when profile data is available', async () => {
      // Use default MSW handler which returns a profile
      renderWithProviders(
        <SessionCheckMiddleware
          to="/login"
          whenProfileExist={false}
        >
          <div>Child Content</div>
        </SessionCheckMiddleware>,
      );

      await waitFor(() => {
        const profile = useAuthenticationStore.getState().profile;
        expect(profile).toEqual(
          expect.objectContaining({
            id: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
            emailVerified: true,
          }),
        );
      });
    });

    it('should not update store profile when profile data is undefined', async () => {
      server.use(
        http.get(buildBackendUrl('/api/v1/get-session'), () => {
          return HttpResponse.json({ user: null, session: null });
        }),
      );

      renderWithProviders(
        <SessionCheckMiddleware
          to="/login"
          whenProfileExist={false}
        >
          <div>Child Content</div>
        </SessionCheckMiddleware>,
      );

      // Wait for the query to complete
      await waitFor(() => {
        expect(screen.getByTestId('navigate')).toBeInTheDocument();
      });

      expect(useAuthenticationStore.getState().profile).toBeUndefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle data without user property', async () => {
      server.use(
        http.get(buildBackendUrl('/api/v1/get-session'), () => {
          // Return empty object (no user property)
          return HttpResponse.json({});
        }),
      );

      renderWithProviders(
        <SessionCheckMiddleware
          to="/login"
          whenProfileExist={false}
        >
          <div>Child Content</div>
        </SessionCheckMiddleware>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('navigate')).toHaveTextContent('/login');
      });
    });

    it('should handle complex children', async () => {
      // Use default MSW handler which returns a profile
      renderWithProviders(
        <SessionCheckMiddleware
          to="/login"
          whenProfileExist={false}
        >
          <div>
            <h1>Title</h1>
            <p>Paragraph</p>
            <button type="button">Action</button>
          </div>
        </SessionCheckMiddleware>,
      );

      await waitFor(() => {
        expect(screen.getByText('Title')).toBeInTheDocument();
      });
      expect(screen.getByText('Paragraph')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Action' }),
      ).toBeInTheDocument();
    });
  });
});
