import { SearchInput } from '@domains/shared/filters/search-input';
import { Route } from '@routes/(authenticated)/$organizationSlug/t/$teamSlug/commands/index';
import { useNavigate } from '@tanstack/react-router';

export function CommandSearchInput() {
  const { search } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  return (
    <SearchInput
      value={search}
      onSearch={(value) =>
        navigate({
          search: (prev) => ({ ...prev, search: value, page: 1 }),
        })
      }
      placeholder="Search commands..."
      ariaLabel="Search commands"
    />
  );
}
