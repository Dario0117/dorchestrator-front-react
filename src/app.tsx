import { createRouter, RouterProvider } from '@tanstack/react-router';
import { queryClient } from './context/query.provider';
import { routeTree } from './routeTree.gen';
import { useOrganizationStore } from './stores/organization.store';

const router = createRouter({
  routeTree,
  // biome-ignore lint/style/noNonNullAssertion: Recommendation from the lib maintainers
  context: { queryClient: undefined!, currentOrganization: undefined! },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const { currentOrganization } = useOrganizationStore();
  return (
    <RouterProvider
      router={router}
      context={{
        queryClient,
        currentOrganization,
      }}
    />
  );
}
