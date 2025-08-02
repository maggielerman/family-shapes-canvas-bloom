import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CreateOrganizationDialog from "@/components/organizations/CreateOrganizationDialog";

interface Organization {
  id: string;
  name: string;
  type: string;
  description: string | null;
  role: string;
}

interface OrganizationsWidgetProps {
  organizations: Organization[];
  onOrganizationCreated: () => void;
}

export function OrganizationsWidget({ organizations, onOrganizationCreated }: OrganizationsWidgetProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Organizations
        </CardTitle>
        <CardDescription>
          Organizations you own or are a member of
        </CardDescription>
      </CardHeader>
      <CardContent>
        {organizations.length > 0 ? (
          <div className="space-y-3">
            {organizations.map((org) => (
              <div
                key={org.id}
                className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => navigate(`/organizations/${org.id}`)}
              >
                <div>
                  <h4 className="font-medium">{org.name}</h4>
                  <p className="text-sm text-muted-foreground capitalize">
                    {org.type} • {org.description || 'No description'}
                  </p>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {org.role}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              You're not part of any organizations yet
            </p>
            <CreateOrganizationDialog onOrganizationCreated={onOrganizationCreated} />
          </div>
        )}
      </CardContent>
    </Card>
  );
} 