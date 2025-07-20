import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TestRunner } from '@/components/admin/TestRunner';
import { TestResults } from '@/components/admin/TestResults';
import { TestCoverage } from '@/components/admin/TestCoverage';
import { Button } from '@/components/ui/button';
import { Play, Square, RefreshCw, FileText } from 'lucide-react';

export default function Admin() {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);

  // Simple admin check - allowing any authenticated user for now
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const runTests = async () => {
    setIsRunning(true);
    try {
      // This will integrate with Vitest API
      console.log('Running tests...');
      // Mock results for now
      setTimeout(() => {
        setTestResults({
          total: 15,
          passed: 13,
          failed: 2,
          duration: 2.3
        });
        setIsRunning(false);
      }, 3000);
    } catch (error) {
      console.error('Test run failed:', error);
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Test runner and system administration</p>
        </div>

        <Tabs defaultValue="tests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tests">Test Runner</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="coverage">Coverage</TabsTrigger>
          </TabsList>

          <TabsContent value="tests">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Test Runner
                </CardTitle>
                <CardDescription>
                  Run and monitor your test suites
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <Button 
                    onClick={runTests}
                    disabled={isRunning}
                    className="flex items-center gap-2"
                  >
                    {isRunning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Run All Tests
                      </>
                    )}
                  </Button>
                  <Button variant="outline" disabled={!isRunning}>
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                  <Button variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    View Logs
                  </Button>
                </div>
                
                <TestRunner isRunning={isRunning} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <TestResults results={testResults} />
          </TabsContent>

          <TabsContent value="coverage">
            <TestCoverage />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}