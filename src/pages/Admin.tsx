import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, TestTube, Database, Settings, Trash2, TreePine } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ConnectionService } from '@/services/connectionService';
import { FamilyChartTestSuite } from '@/test/components/FamilyChartTestSuite';
import { FamilyChartLibraryAnalysis } from '@/test/components/FamilyChartLibraryAnalysis';
import { FamilyChartFixedImplementation } from '@/test/components/FamilyChartFixedImplementation';

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
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDebugging(false);
    }
  };

  const handleCleanupDuplicates = async () => {
    if (!window.confirm('This will remove duplicate connections from the database. Continue?')) {
      return;
    }

    setIsCleaning(true);
    try {
      const result = await ConnectionService.cleanupDuplicateConnections();
      
      toast({
        title: "Cleanup Complete",
        description: `Removed ${result.removed} duplicate connections. ${result.errors.length} errors occurred.`,
        variant: result.errors.length > 0 ? "destructive" : "default",
      });

      if (result.errors.length > 0) {
        console.error('Cleanup errors:', result.errors);
      }
    } catch (error) {
      console.error('Cleanup error:', error);
      toast({
        title: "Cleanup Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Development tools and system administration</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Vitest UI Card */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Test Runner
              </CardTitle>
              <CardDescription>
                Run and monitor tests with Vitest's built-in UI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Use Vitest's comprehensive test interface for running, debugging, and analyzing your test suites.
                </p>
                <Button 
                  onClick={openVitestUI}
                  className="w-full flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Vitest UI
                </Button>
                <div className="text-xs text-muted-foreground">
                  Requires: <code>npm run test:ui</code> to be running
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database Admin Card */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Database Admin
              </CardTitle>
              <CardDescription>
                Manage Supabase database and inspect data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Access the Supabase dashboard for database management, table inspection, and real-time data monitoring.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                  className="w-full flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Supabase Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Database Cleanup Card */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Database Cleanup
              </CardTitle>
              <CardDescription>
                Remove duplicate connections for all relationship types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Clean up duplicate database records for all relationship types (parent/child, sibling, partner, etc.).
                </p>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleDebugConnections}
                    disabled={isDebugging}
                  >
                    {isDebugging ? "Checking..." : "Check for Duplicates"}
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleCleanupDuplicates}
                    disabled={isCleaning}
                  >
                    {isCleaning ? "Cleaning..." : "Remove Duplicates"}
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => window.open('/connections', '_blank')}
                  >
                    Test Connections Page
                  </Button>
                </div>

                {/* Debug Results Display */}
                {debugResult && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Debug Results:</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Total bidirectional connections:</strong> {debugResult.total}</div>
                      <div><strong>Duplicate groups found:</strong> {debugResult.duplicates.length}</div>
                      
                      {Object.entries(debugResult.byType).length > 0 && (
                        <div>
                          <strong>By relationship type:</strong>
                          <ul className="ml-4 mt-1">
                            {Object.entries(debugResult.byType).map(([type, count]) => (
                              <li key={type}>• {type}: {count}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {debugResult.duplicates.length > 0 && (
                        <div>
                          <strong>Duplicate groups:</strong>
                          <ul className="ml-4 mt-1 space-y-1">
                            {debugResult.duplicates.map((dup, index) => (
                              <li key={index} className="text-xs">
                                • {dup.type}: {dup.personA} ↔ {dup.personB} ({dup.count} records)
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  This will permanently remove duplicate connection records
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Development Tools Card */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Development Tools
              </CardTitle>
              <CardDescription>
                Additional development utilities and debugging tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Access browser dev tools, network monitoring, and other debugging utilities.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    console.log('Development mode enabled');
                    alert('Check browser console for development logs');
                  }}
                  className="w-full"
                >
                  Enable Debug Mode
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Family Chart Test Suite Card */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreePine className="w-5 h-5" />
                Family Chart Test Suite
              </CardTitle>
              <CardDescription>
                Comprehensive testing for the family-chart library implementation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Test the family-chart library integration, data transformation, and chart rendering.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    const testSuite = document.getElementById('family-chart-test-suite');
                    if (testSuite) {
                      testSuite.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full"
                >
                  View Test Suite
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>
              How to use the admin dashboard effectively
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">1. Start Vitest UI</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded">npm run test:ui</code>
              <p className="text-sm text-muted-foreground mt-1">
                This starts Vitest's web interface with real-time test running, coverage reports, and debugging tools.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Run Tests</h4>
              <p className="text-sm text-muted-foreground">
                Use the Vitest UI to run specific tests, watch for changes, and view detailed results with stack traces.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">3. Database Management</h4>
              <p className="text-sm text-muted-foreground">
                Use the Supabase dashboard to inspect tables, run queries, and manage your database schema.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">4. Database Cleanup</h4>
              <p className="text-sm text-muted-foreground">
                Use the cleanup tool to remove duplicate bidirectional connections that may have been created before the fix.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Family Chart Test Suite */}
        <div id="family-chart-test-suite" className="mt-8">
          <FamilyChartTestSuite 
            persons={[]} 
            connections={[]} 
          />
        </div>

        {/* Family Chart Library Analysis */}
        <div id="family-chart-analysis" className="mt-8">
          <FamilyChartLibraryAnalysis 
            persons={[]} 
            connections={[]} 
          />
        </div>

        {/* Family Chart Fixed Implementation */}
        <div id="family-chart-fixed" className="mt-8">
          <FamilyChartFixedImplementation 
            persons={[]} 
            connections={[]} 
          />
        </div>
      </div>
    </div>
  );
}