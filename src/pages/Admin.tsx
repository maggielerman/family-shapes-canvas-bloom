import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, TestTube, Database, Settings, Bug } from 'lucide-react';
import { DatabaseTest } from '@/components/debug/DatabaseTest';

export default function Admin() {
  const openVitestUI = () => {
    // In development, Vitest UI is typically served on port 51204
    const vitestUrl = 'http://localhost:51204';
    window.open(vitestUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Development tools and system administration</p>
        </div>

        {/* Database Debug Component */}
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Bug className="w-5 h-5" />
              Database Connectivity Testing
            </CardTitle>
            <CardDescription className="text-orange-700">
              Test database connections, RLS policies, and query functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DatabaseTest />
          </CardContent>
        </Card>

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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}