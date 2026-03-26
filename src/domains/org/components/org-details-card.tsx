import { Box } from '@components/ds/atoms/box';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ds/atoms/card';
import { DefinitionList } from '@components/ds/atoms/definition-list';
import { DefinitionValue } from '@components/ds/atoms/definition-value';
import { MetadataLabel } from '@components/ds/atoms/metadata-label';
import { Building2 } from 'lucide-react';

interface OrgDetailsCardProps {
  name: string;
  id: string;
  createdAt?: string | null;
}

export function OrgDetailsCard({ name, id, createdAt }: OrgDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle icon>
          <Building2 className="h-5 w-5 text-muted-foreground" />
          Organization Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DefinitionList>
          <Box>
            <MetadataLabel>Organization Name</MetadataLabel>
            <DefinitionValue>{name}</DefinitionValue>
          </Box>

          <Box>
            <MetadataLabel>Organization ID</MetadataLabel>
            <DefinitionValue mono>{id}</DefinitionValue>
          </Box>

          <Box>
            <MetadataLabel>Created</MetadataLabel>
            <DefinitionValue>
              {createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}
            </DefinitionValue>
          </Box>
        </DefinitionList>
      </CardContent>
    </Card>
  );
}
