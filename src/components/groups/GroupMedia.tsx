import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Image } from "lucide-react";

interface GroupMediaProps {
  groupId: string;
  canManage: boolean;
}

export function GroupMedia({ groupId, canManage }: GroupMediaProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Media Gallery
        </CardTitle>
        <CardDescription>
          Share photos and documents with group members
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Media gallery functionality will be available soon
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This feature allows group members to share and organize photos and documents
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default GroupMedia;