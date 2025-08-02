import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuickActionsWidgetProps {
  onCreateTree: () => void;
}

export function QuickActionsWidget({ onCreateTree }: QuickActionsWidgetProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>Get started with your family tree journey</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={onCreateTree} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Create New Family Tree
        </Button>
        <Button variant="outline" onClick={() => navigate("/people")} className="w-full">
          <Users className="mr-2 h-4 w-4" />
          Add Family Members
        </Button>
        <Button variant="outline" onClick={() => navigate("/organizations")} className="w-full">
          <Building2 className="mr-2 h-4 w-4" />
          Manage Organizations
        </Button>
      </CardContent>
    </Card>
  );
} 