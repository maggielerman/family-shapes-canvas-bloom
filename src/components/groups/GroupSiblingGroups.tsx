import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface GroupSiblingGroupsProps {
  groupId: string;
  canManage: boolean;
}

export function GroupSiblingGroups({ groupId, canManage }: GroupSiblingGroupsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Sibling Groups
        </CardTitle>
        <CardDescription>
          Manage sibling connections within this group
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Sibling groups functionality will be available soon
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This feature allows organizing members into sibling groups based on donor connections
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default GroupSiblingGroups;