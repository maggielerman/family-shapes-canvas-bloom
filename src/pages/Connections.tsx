import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectionManager } from "@/components/connections/ConnectionManager";
import { ConnectionDisplay } from "@/components/connections/ConnectionDisplay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Network, Users, GitBranch } from "lucide-react";

const Connections = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Network className="h-8 w-8 text-coral-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Family Connections</h1>
          <p className="text-gray-600">Manage relationships between family members</p>
        </div>
      </div>

      <Tabs defaultValue="manage" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Manage Connections
          </TabsTrigger>
          <TabsTrigger value="view" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            View Connections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Connection Manager
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ConnectionManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="view" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Connection Display
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ConnectionDisplay />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Connections;