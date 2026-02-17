import { useCurrentOrganization } from '@hooks/use-current-organization';
import { Route } from '@routes/(authenticated)/$organizationSlug/commands/$commandId';
import { useGetCommandSuspenseQuery } from '@services/commands/get-command.http-service';

export function CommandDetailsPage() {
  const currentOrganization = useCurrentOrganization();
  const { commandId } = Route.useParams();

  const { data } = useGetCommandSuspenseQuery(
    currentOrganization.id,
    Number(commandId),
  );

  return (
    <section className="p-6 md:p-10 space-y-6">
      <h1 className="text-3xl font-bold">Command Detail</h1>
      <pre className="rounded-lg border bg-muted p-4 overflow-auto text-sm">
        {JSON.stringify(data.responseData?.results, null, 2)}
      </pre>
    </section>
  );
}
