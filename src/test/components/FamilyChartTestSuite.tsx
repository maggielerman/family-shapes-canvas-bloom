import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Person } from '@/types/person';
import { Connection } from '@/types/connection';
import { transformToFamilyChartData, transformToSimpleFamilyData, findRootNode } from '@/utils/familyChartAdapter';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

interface FamilyChartTestSuiteProps {
  persons: Person[];
  connections: Connection[];
}

export function FamilyChartTestSuite({ persons, connections }: FamilyChartTestSuiteProps) {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [libraryInfo, setLibraryInfo] = useState<any>(null);
  const [chartContainer, setChartContainer] = useState<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sample test data
  const samplePersons: Person[] = [
    {
      id: '1',
      name: 'John Doe',
      gender: 'male',
      date_of_birth: '1980-01-01',
      profile_photo_url: undefined,
      is_self: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Jane Doe',
      gender: 'female',
      date_of_birth: '1982-01-01',
      profile_photo_url: undefined,
      is_self: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Child Doe',
      gender: 'male',
      date_of_birth: '2010-01-01',
      profile_photo_url: undefined,
      is_self: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const sampleConnections: Connection[] = [
    {
      id: '1',
      from_person_id: '1',
      to_person_id: '2',
      relationship_type: 'spouse',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      from_person_id: '1',
      to_person_id: '3',
      relationship_type: 'parent',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      from_person_id: '2',
      to_person_id: '3',
      relationship_type: 'parent',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const runLibraryDetectionTest = async () => {
    addTestResult({
      name: 'Library Detection',
      status: 'success',
      message: 'Starting library detection test...'
    });

    try {
      // Test 1: Check if family-chart is available
      const familyChartModule = await import('family-chart');
      addTestResult({
        name: 'Import Test',
        status: 'success',
        message: 'Successfully imported family-chart module',
        details: {
          moduleType: typeof familyChartModule,
          hasDefault: !!familyChartModule.default,
          keys: Object.keys(familyChartModule)
        }
      });

      const familyChart = familyChartModule.default || familyChartModule;
      setLibraryInfo({
        module: familyChartModule,
        main: familyChart,
        type: typeof familyChart,
        keys: Object.keys(familyChartModule)
      });

      // Test 2: Check for expected methods
      const expectedMethods = ['createChart', 'CardHtml', 'FamilyChart'];
      const foundMethods = expectedMethods.filter(method => 
        typeof familyChart[method] === 'function' || typeof familyChartModule[method] === 'function'
      );

      addTestResult({
        name: 'Method Detection',
        status: foundMethods.length > 0 ? 'success' : 'warning',
        message: `Found ${foundMethods.length}/${expectedMethods.length} expected methods`,
        details: {
          found: foundMethods,
          missing: expectedMethods.filter(m => !foundMethods.includes(m)),
          allKeys: Object.keys(familyChart)
        }
      });

    } catch (error) {
      addTestResult({
        name: 'Import Test',
        status: 'error',
        message: `Failed to import family-chart: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      });
    }
  };

  const runDataTransformationTest = () => {
    addTestResult({
      name: 'Data Transformation',
      status: 'success',
      message: 'Testing data transformation...'
    });

    try {
      // Test with sample data
      const complexData = transformToFamilyChartData(samplePersons, sampleConnections);
      const simpleData = transformToSimpleFamilyData(samplePersons, sampleConnections);

      addTestResult({
        name: 'Complex Transformation',
        status: 'success',
        message: `Successfully transformed ${complexData.nodes.length} nodes`,
        details: {
          nodes: complexData.nodes,
          rootId: findRootNode(complexData.nodes, samplePersons)
        }
      });

      addTestResult({
        name: 'Simple Transformation',
        status: 'success',
        message: `Successfully transformed ${simpleData.length} nodes`,
        details: {
          nodes: simpleData,
          rootId: findRootNode(simpleData, samplePersons)
        }
      });

      // Test with actual data
      if (persons.length > 0) {
        const actualComplexData = transformToFamilyChartData(persons, connections);
        const actualSimpleData = transformToSimpleFamilyData(persons, connections);

        addTestResult({
          name: 'Actual Data Transformation',
          status: 'success',
          message: `Transformed ${actualComplexData.nodes.length} actual nodes`,
          details: {
            nodes: actualComplexData.nodes,
            rootId: findRootNode(actualComplexData.nodes, persons)
          }
        });
      }

    } catch (error) {
      addTestResult({
        name: 'Data Transformation',
        status: 'error',
        message: `Data transformation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      });
    }
  };

  const runChartCreationTest = async () => {
    addTestResult({
      name: 'Chart Creation',
      status: 'success',
      message: 'Testing chart creation...'
    });

    if (!libraryInfo || !containerRef.current) {
      addTestResult({
        name: 'Chart Creation',
        status: 'error',
        message: 'Library not loaded or container not available'
      });
      return;
    }

    try {
      const { main: familyChart } = libraryInfo;
      const testData = transformToSimpleFamilyData(samplePersons, sampleConnections);
      const rootId = findRootNode(testData, samplePersons);

      // Clear container
      containerRef.current.innerHTML = '';

      // Test different API signatures
      const signatures = [
        {
          name: 'Signature 1: createChart(container, config)',
          test: () => {
            if (typeof familyChart.createChart === 'function') {
              return familyChart.createChart(containerRef.current, {
                nodes: testData,
                rootId: rootId,
                nodeBinding: {
                  field_0: 'name',
                  img_0: 'img',
                  field_1: 'birthday'
                }
              });
            }
            throw new Error('createChart not found');
          }
        },
        {
          name: 'Signature 2: FamilyChart constructor',
          test: () => {
            if (typeof familyChart.FamilyChart === 'function') {
              return new familyChart.FamilyChart(containerRef.current, {
                data: testData,
                rootId: rootId
              });
            }
            throw new Error('FamilyChart constructor not found');
          }
        },
        {
          name: 'Signature 3: Direct function call',
          test: () => {
            if (typeof familyChart === 'function') {
              return new familyChart(containerRef.current, {
                data: testData,
                rootId: rootId
              });
            }
            throw new Error('familyChart is not a constructor');
          }
        },
        {
          name: 'Signature 4: CardHtml approach',
          test: () => {
            if (familyChart.CardHtml) {
              // Try CardHtml approach
              return familyChart.CardHtml(containerRef.current, testData);
            }
            throw new Error('CardHtml not found');
          }
        }
      ];

      let successCount = 0;
      for (const signature of signatures) {
        try {
          const result = signature.test();
          addTestResult({
            name: signature.name,
            status: 'success',
            message: 'Chart created successfully',
            details: { result: typeof result, hasMethods: result ? Object.keys(result) : [] }
          });
          successCount++;
          
          // Wait a bit to see if chart renders
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if anything was rendered
          const hasContent = containerRef.current.innerHTML.trim().length > 0;
          addTestResult({
            name: `${signature.name} - Rendering`,
            status: hasContent ? 'success' : 'warning',
            message: hasContent ? 'Chart content detected' : 'No chart content rendered',
            details: {
              innerHTML: containerRef.current.innerHTML.substring(0, 200) + '...',
              hasSVG: containerRef.current.querySelector('svg') !== null,
              hasCanvas: containerRef.current.querySelector('canvas') !== null
            }
          });

        } catch (error) {
          addTestResult({
            name: signature.name,
            status: 'error',
            message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            details: { error }
          });
        }
      }

      addTestResult({
        name: 'Chart Creation Summary',
        status: successCount > 0 ? 'success' : 'error',
        message: `${successCount}/${signatures.length} chart creation methods succeeded`
      });

    } catch (error) {
      addTestResult({
        name: 'Chart Creation',
        status: 'error',
        message: `Chart creation test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      });
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    await runLibraryDetectionTest();
    runDataTransformationTest();
    await runChartCreationTest();

    setIsRunning(false);
  };

  useEffect(() => {
    if (containerRef.current) {
      setChartContainer(containerRef.current);
    }
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Family Chart Library Test Suite</CardTitle>
          <CardDescription>
            Comprehensive testing for the family-chart library implementation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="flex-1"
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setTestResults([])}
              disabled={isRunning}
            >
              Clear Results
            </Button>
          </div>

          {libraryInfo && (
            <Alert className="mb-4">
              <AlertDescription>
                <strong>Library Info:</strong> Type: {libraryInfo.type}, 
                Keys: {libraryInfo.keys.join(', ')}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="results" className="w-full">
            <TabsList>
              <TabsTrigger value="results">Test Results</TabsTrigger>
              <TabsTrigger value="chart">Chart Test</TabsTrigger>
              <TabsTrigger value="data">Data Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="space-y-4">
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Badge 
                      variant={result.status === 'success' ? 'default' : 
                               result.status === 'warning' ? 'secondary' : 'destructive'}
                    >
                      {result.status}
                    </Badge>
                    <div className="flex-1">
                      <div className="font-medium">{result.name}</div>
                      <div className="text-sm text-muted-foreground">{result.message}</div>
                      {result.details && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm text-blue-600">
                            View Details
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="chart">
              <Card>
                <CardHeader>
                  <CardTitle>Chart Test Container</CardTitle>
                  <CardDescription>
                    This container will be used to test chart rendering
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div 
                    ref={containerRef}
                    className="w-full h-96 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center"
                  >
                    <div className="text-gray-500">
                      Chart test container - charts will render here during tests
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Sample Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <strong>Sample Persons:</strong> {samplePersons.length}
                      </div>
                      <div>
                        <strong>Sample Connections:</strong> {sampleConnections.length}
                      </div>
                      <div>
                        <strong>Actual Persons:</strong> {persons.length}
                      </div>
                      <div>
                        <strong>Actual Connections:</strong> {connections.length}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Transformed Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <details>
                      <summary className="cursor-pointer font-medium">
                        View Sample Transformed Data
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-96">
                        {JSON.stringify(transformToSimpleFamilyData(samplePersons, sampleConnections), null, 2)}
                      </pre>
                    </details>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 