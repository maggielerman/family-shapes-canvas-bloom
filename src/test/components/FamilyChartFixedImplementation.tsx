import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Person } from '@/types/person';
import { Connection } from '@/types/connection';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

interface FamilyChartFixedImplementationProps {
  persons: Person[];
  connections: Connection[];
}

export function FamilyChartFixedImplementation({ persons, connections }: FamilyChartFixedImplementationProps) {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [chartInstance, setChartInstance] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sample test data with correct format
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

  // Fixed data transformation function
  const transformToFamilyChartFormat = (persons: Person[], connections: Connection[]) => {
    const nodes = persons.map(person => {
      const node: any = {
        id: person.id,
        name: person.name || 'Unknown',
        // Convert gender to M/F format as expected by the library
        gender: person.gender === 'male' ? 'M' : person.gender === 'female' ? 'F' : undefined,
        img: person.profile_photo_url || undefined,
        pids: [], // Initialize partner IDs
        _data: person // Store original data
      };

      // Find parent connections
      const parentConnections = connections.filter(conn => {
        if (conn.relationship_type === 'parent' && conn.to_person_id === person.id) {
          return true;
        }
        if (conn.relationship_type === 'child' && conn.from_person_id === person.id) {
          return true;
        }
        return false;
      });

      // Set parent IDs
      parentConnections.forEach(conn => {
        let parentId: string;
        
        if (conn.relationship_type === 'parent' && conn.to_person_id === person.id) {
          parentId = conn.from_person_id;
        } else if (conn.relationship_type === 'child' && conn.from_person_id === person.id) {
          parentId = conn.to_person_id;
        } else {
          return;
        }
        
        const parent = persons.find(p => p.id === parentId);
        if (parent) {
          if (parent.gender === 'male') {
            if (!node.fid) {
              node.fid = parent.id;
            }
          } else if (parent.gender === 'female') {
            if (!node.mid) {
              node.mid = parent.id;
            }
          } else {
            // Unknown gender - assign to available slot
            if (!node.fid) {
              node.fid = parent.id;
            } else if (!node.mid) {
              node.mid = parent.id;
            }
          }
        }
      });

      // Find spouse connections
      const spouseConnections = connections.filter(
        conn => (conn.from_person_id === person.id || conn.to_person_id === person.id) &&
        (conn.relationship_type === 'spouse' || conn.relationship_type === 'partner')
      );

      // Set partner IDs
      spouseConnections.forEach(conn => {
        const partnerId = conn.from_person_id === person.id ? conn.to_person_id : conn.from_person_id;
        if (!node.pids.includes(partnerId)) {
          node.pids.push(partnerId);
        }
      });

      return node;
    });

    return nodes;
  };

  const findRootNode = (nodes: any[], persons: Person[]): string | undefined => {
    // First, try to find a person marked as self
    const selfPerson = persons.find(p => p.is_self === true);
    if (selfPerson) {
      return selfPerson.id;
    }
    
    // If no self person, find someone without parents
    const rootNode = nodes.find(node => !node.mid && !node.fid);
    if (rootNode) {
      return rootNode.id;
    }
    
    // Fallback to first node
    return nodes.length > 0 ? nodes[0].id : undefined;
  };

  const runFixedImplementationTest = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      addTestResult({
        name: 'Starting Fixed Implementation Test',
        status: 'success',
        message: 'Testing fixed family-chart implementation...'
      });

      // Step 1: Import library
      const familyChartModule = await import('family-chart');
      const familyChart = familyChartModule.default || familyChartModule;

      addTestResult({
        name: 'Library Import',
        status: 'success',
        message: 'Successfully imported family-chart library',
        details: {
          moduleType: typeof familyChartModule,
          hasDefault: !!familyChartModule.default,
          keys: Object.keys(familyChartModule)
        }
      });

      // Step 2: Transform data with correct format
      const testData = transformToFamilyChartFormat(samplePersons, sampleConnections);
      const rootId = findRootNode(testData, samplePersons);

      addTestResult({
        name: 'Data Transformation',
        status: 'success',
        message: `Transformed ${testData.length} nodes with correct format`,
        details: {
          nodes: testData,
          rootId,
          genderFormat: testData.map(n => ({ id: n.id, gender: n.gender })),
          hasCorrectGender: testData.every(n => n.gender === 'M' || n.gender === 'F' || n.gender === undefined)
        }
      });

      // Step 3: Test chart creation with different approaches
      if (!containerRef.current) {
        addTestResult({
          name: 'Container Check',
          status: 'error',
          message: 'Container not available'
        });
        return;
      }

      // Clear container
      containerRef.current.innerHTML = '';

      const approaches = [
        {
          name: 'Approach 1: createChart with correct format',
          test: () => {
            if (typeof familyChart.createChart === 'function') {
              return familyChart.createChart(containerRef.current, {
                nodes: testData,
                rootId: rootId,
                nodeBinding: {
                  field_0: 'name',
                  img_0: 'img',
                  field_1: 'birthday'
                },
                width: 800,
                height: 600
              });
            }
            throw new Error('createChart not found');
          }
        },
        {
          name: 'Approach 2: FamilyChart constructor',
          test: () => {
            if (typeof familyChart.FamilyChart === 'function') {
              return new familyChart.FamilyChart(containerRef.current, {
                data: testData,
                rootId: rootId,
                nodeBinding: {
                  field_0: 'name',
                  img_0: 'img',
                  field_1: 'birthday'
                }
              });
            }
            throw new Error('FamilyChart constructor not found');
          }
        },
        {
          name: 'Approach 3: Direct constructor',
          test: () => {
            if (typeof familyChart === 'function') {
              return new familyChart(containerRef.current, {
                data: testData,
                rootId: rootId,
                nodeBinding: {
                  field_0: 'name',
                  img_0: 'img',
                  field_1: 'birthday'
                }
              });
            }
            throw new Error('familyChart is not a constructor');
          }
        },
        {
          name: 'Approach 4: Minimal configuration',
          test: () => {
            if (typeof familyChart.createChart === 'function') {
              return familyChart.createChart(containerRef.current, {
                nodes: testData,
                rootId: rootId
              });
            }
            throw new Error('createChart not found');
          }
        }
      ];

      let successCount = 0;
      for (const approach of approaches) {
        try {
          addTestResult({
            name: approach.name,
            status: 'info',
            message: 'Attempting to create chart...'
          });

          const result = approach.test();
          
          addTestResult({
            name: `${approach.name} - Creation`,
            status: 'success',
            message: 'Chart created successfully',
            details: {
              resultType: typeof result,
              hasMethods: result ? Object.keys(result) : []
            }
          });

          // Wait for rendering
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Check if content was rendered
          const hasContent = containerRef.current.innerHTML.trim().length > 0;
          const hasSVG = containerRef.current.querySelector('svg') !== null;
          const hasCanvas = containerRef.current.querySelector('canvas') !== null;
          const hasDivs = containerRef.current.querySelectorAll('div').length > 0;

          addTestResult({
            name: `${approach.name} - Rendering`,
            status: hasContent ? 'success' : 'warning',
            message: hasContent ? 'Chart content detected' : 'No chart content rendered',
            details: {
              hasContent,
              hasSVG,
              hasCanvas,
              hasDivs,
              innerHTML: containerRef.current.innerHTML.substring(0, 300) + '...',
              elementCount: containerRef.current.children.length
            }
          });

          if (hasContent) {
            successCount++;
            setChartInstance(result);
          }

        } catch (error) {
          addTestResult({
            name: approach.name,
            status: 'error',
            message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            details: { error }
          });
        }
      }

      addTestResult({
        name: 'Overall Test Summary',
        status: successCount > 0 ? 'success' : 'error',
        message: `${successCount}/${approaches.length} approaches succeeded`,
        details: {
          successCount,
          totalApproaches: approaches.length,
          recommendations: successCount === 0 ? [
            'Check library version compatibility',
            'Verify data format requirements',
            'Test with minimal data',
            'Check browser console for errors'
          ] : [
            'Use the successful approach in main implementation',
            'Add proper error handling',
            'Test with larger datasets'
          ]
        }
      });

    } catch (error) {
      addTestResult({
        name: 'Test Error',
        status: 'error',
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fixed Family Chart Implementation</CardTitle>
          <CardDescription>
            Testing corrected implementation based on library analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button 
              onClick={runFixedImplementationTest} 
              disabled={isRunning}
              className="flex-1"
            >
              {isRunning ? 'Running Tests...' : 'Run Fixed Implementation Test'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setTestResults([])}
              disabled={isRunning}
            >
              Clear Results
            </Button>
          </div>

          <Tabs defaultValue="results" className="w-full">
            <TabsList>
              <TabsTrigger value="results">Test Results</TabsTrigger>
              <TabsTrigger value="chart">Chart Test</TabsTrigger>
              <TabsTrigger value="data">Fixed Data Format</TabsTrigger>
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
                    This container will be used to test the fixed chart implementation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div 
                    ref={containerRef}
                    className="w-full h-96 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center"
                  >
                    <div className="text-gray-500">
                      Chart test container - fixed implementation will render here
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Fixed Data Format</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <strong>Key Changes:</strong>
                      </div>
                      <ul className="text-sm space-y-1 ml-4">
                        <li>• Gender format: male/female → M/F</li>
                        <li>• Simplified data structure</li>
                        <li>• Proper parent/child relationships</li>
                        <li>• Correct partner ID arrays</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sample Transformed Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <details>
                      <summary className="cursor-pointer font-medium">
                        View Fixed Data Format
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-96">
                        {JSON.stringify(transformToFamilyChartFormat(samplePersons, sampleConnections), null, 2)}
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