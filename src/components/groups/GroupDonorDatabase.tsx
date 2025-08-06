import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";

interface GroupDonorDatabaseProps {
  groupId: string;
  canManage: boolean;
}

export function GroupDonorDatabase({ groupId, canManage }: GroupDonorDatabaseProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Donor Database
        </CardTitle>
        <CardDescription>
          Manage donor information for this group
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Donor database functionality will be available soon
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This feature allows groups to maintain their own donor information database
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default GroupDonorDatabase;