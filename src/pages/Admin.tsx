import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ExternalLink, 
  TestTube, 
  Database, 
  Settings, 
  Bug, 
  Trash2, 
  Building2, 
  TreePine,
  Shield,
  LogOut,
  Users,
  Activity,
  BarChart,
  Clock
} from 'lucide-react';
import { DatabaseTest } from '@/components/debug/DatabaseTest';
import { useToast } from '@/hooks/use-toast';
import { ConnectionService } from '@/services/connectionService';
import { OrganizationStructureViewer } from '@/components/admin/OrganizationStructureViewer';
import { OrganizationFlowExamples } from '@/components/admin/OrganizationFlowExamples';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { format } from 'date-fns';

export default function Admin() {
  const [isCleaning, setIsCleaning] = useState(false);
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugResult, setDebugResult] = useState<{
    total: number;
    byType: Record<string, number>;
    duplicates: Array<{
      type: string;
      personA: string;
      personB: string;
      count: number;
      connectionIds: string[];
    }>;
  } | null>(null);
  const { toast } = useToast();
  const { user, userRole, signOut, isSuperAdmin } = useAdminAuth();

  const openVitestUI = () => {
    // In development, Vitest UI is typically served on port 51204
    const vitestUrl = 'http://localhost:51204';
    window.open(vitestUrl, '_blank');
  };

  const handleDebugConnections = async () => {
    setIsDebugging(true);
    try {
      const result = await ConnectionService.debugConnections();
      setDebugResult(result);
      
      // Log to console for detailed debugging
      console.log('Debug Results:', result);
      
      toast({
        title: "Debug Complete",
        description: `Found ${result.total} connections. ${result.duplicates.length} duplicate groups detected.`,
      });
    } catch (error) {
      console.error('Debug error:', error);
      toast({
        title: "Debug Error",
        description: "Failed to debug connections. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsDebugging(false);
    }
  };

  const handleCleanupDuplicates = async () => {
    if (!debugResult || debugResult.duplicates.length === 0) {
      toast({
        title: "No duplicates to clean",
        description: "Run debug first to identify duplicates.",
        variant: "destructive",
      });
      return;
    }

    setIsCleaning(true);
    try {
      let cleanedCount = 0;
      
      for (const dup of debugResult.duplicates) {
        // Keep the first connection, remove the rest
        const [keep, ...remove] = dup.connectionIds;
        
        for (const id of remove) {
          await ConnectionService.deleteConnection(id);
          cleanedCount++;
        }
      }
      
      toast({
        title: "Cleanup Complete",
        description: `Removed ${cleanedCount} duplicate connections.`,
      });
      
      // Re-run debug to show updated state
      await handleDebugConnections();
    } catch (error) {
      console.error('Cleanup error:', error);
      toast({
        title: "Cleanup Error",
        description: "Failed to clean up duplicates. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              </div>
              <Badge variant={isSuperAdmin ? "default" : "secondary"}>
                {userRole}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">{user?.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">--</span>
                <Users className="h-4 w-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">--</span>
                <Activity className="h-4 w-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Organizations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">--</span>
                <Building2 className="h-4 w-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Last Login</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm">{format(new Date(), 'HH:mm')}</span>
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Admin Tabs */}
        <Tabs defaultValue="testing" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="testing">Testing</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="organizations">Organizations</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="testing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Testing Tools
                </CardTitle>
                <CardDescription>
                  Development and testing utilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-medium">Vitest UI</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Interactive test runner and results viewer
                    </p>
                  </div>
                  <Button onClick={openVitestUI} size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Vitest UI
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="font-medium">Quick Commands</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Run these commands in your terminal:
                  </p>
                  <div className="space-y-2">
                    <code className="block p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                      npm run test:ui
                    </code>
                    <code className="block p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                      npm run test
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Tools
                </CardTitle>
                <CardDescription>
                  Database testing and maintenance utilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DatabaseTest />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  Connection Debugging
                </CardTitle>
                <CardDescription>
                  Debug and clean up duplicate connections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button 
                    onClick={handleDebugConnections}
                    disabled={isDebugging}
                    variant="outline"
                  >
                    {isDebugging ? "Debugging..." : "Debug Connections"}
                  </Button>
                  <Button 
                    onClick={handleCleanupDuplicates}
                    disabled={isCleaning || !debugResult || debugResult.duplicates.length === 0}
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isCleaning ? "Cleaning..." : "Clean Duplicates"}
                  </Button>
                </div>

                {debugResult && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Connections</p>
                        <p className="text-2xl font-bold">{debugResult.total}</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Duplicate Groups</p>
                        <p className="text-2xl font-bold">{debugResult.duplicates.length}</p>
                      </div>
                    </div>

                    {debugResult.duplicates.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Duplicates Found:</h4>
                        <ScrollArea className="h-64 w-full rounded-lg border">
                          <div className="p-4 space-y-2">
                            {debugResult.duplicates.map((dup, idx) => (
                              <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                                <p className="font-medium">{dup.type} Connection</p>
                                <p className="text-gray-600 dark:text-gray-400">
                                  {dup.personA} ↔ {dup.personB} ({dup.count} duplicates)
                                </p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="organizations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Organization Structure
                </CardTitle>
                <CardDescription>
                  View and analyze organization relationships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrganizationStructureViewer />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TreePine className="h-5 w-5" />
                  Organization Flow Examples
                </CardTitle>
                <CardDescription>
                  Test organization invitation and setup flows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrganizationFlowExamples />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  System Monitoring
                </CardTitle>
                <CardDescription>
                  Monitor system health and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BarChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Monitoring features coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}