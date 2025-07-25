import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Person } from '@/types/person';
import { Connection } from '@/types/connection';

interface LibraryAnalysis {
  name: string;
  status: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: any;
}

interface FamilyChartLibraryAnalysisProps {
  persons: Person[];
  connections: Connection[];
}

export function FamilyChartLibraryAnalysis({ persons, connections }: FamilyChartLibraryAnalysisProps) {
  const [analysisResults, setAnalysisResults] = useState<LibraryAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [libraryModule, setLibraryModule] = useState<any>(null);

  const addAnalysisResult = (result: LibraryAnalysis) => {
    setAnalysisResults(prev => [...prev, result]);
  };

  const runLibraryAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisResults([]);

    try {
      // Step 1: Import and analyze the library
      addAnalysisResult({
        name: 'Library Import',
        status: 'info',
        message: 'Attempting to import family-chart library...'
      });

      const familyChartModule = await import('family-chart');
      
      addAnalysisResult({
        name: 'Import Success',
        status: 'success',
        message: 'Successfully imported family-chart module',
        details: {
          moduleType: typeof familyChartModule,
          hasDefault: !!familyChartModule.default,
          moduleKeys: Object.keys(familyChartModule),
          defaultType: typeof familyChartModule.default
        }
      });

      const familyChart = familyChartModule.default || familyChartModule;
      setLibraryModule(familyChart);

      // Step 2: Analyze the library structure
      addAnalysisResult({
        name: 'Library Structure Analysis',
        status: 'info',
        message: 'Analyzing library structure and available methods...'
      });

      const allKeys = Object.keys(familyChart);
      const functionKeys = allKeys.filter(key => typeof familyChart[key] === 'function');
      const nonFunctionKeys = allKeys.filter(key => typeof familyChart[key] !== 'function');

      addAnalysisResult({
        name: 'Library Structure',
        status: 'success',
        message: `Found ${allKeys.length} total keys, ${functionKeys.length} functions`,
        details: {
          allKeys,
          functionKeys,
          nonFunctionKeys
        }
      });

      // Step 3: Check for expected methods based on GitHub documentation
      const expectedMethods = [
        'createChart',
        'CardHtml', 
        'FamilyChart',
        'create',
        'init',
        'render'
      ];

      const foundMethods = expectedMethods.filter(method => 
        typeof familyChart[method] === 'function'
      );

      addAnalysisResult({
        name: 'Expected Methods Check',
        status: foundMethods.length > 0 ? 'success' : 'warning',
        message: `Found ${foundMethods.length}/${expectedMethods.length} expected methods`,
        details: {
          found: foundMethods,
          missing: expectedMethods.filter(m => !foundMethods.includes(m)),
          unexpected: functionKeys.filter(f => !expectedMethods.includes(f))
        }
      });

      // Step 4: Analyze our current implementation issues
      addAnalysisResult({
        name: 'Implementation Analysis',
        status: 'info',
        message: 'Analyzing our current implementation approach...'
      });

      // Check if our current approach matches the library's expected API
      const hasCreateChart = typeof familyChart.createChart === 'function';
      const hasFamilyChart = typeof familyChart.FamilyChart === 'function';
      const isConstructor = typeof familyChart === 'function';

      addAnalysisResult({
        name: 'API Compatibility',
        status: (hasCreateChart || hasFamilyChart || isConstructor) ? 'success' : 'error',
        message: `Library supports: createChart=${hasCreateChart}, FamilyChart=${hasFamilyChart}, isConstructor=${isConstructor}`,
        details: {
          hasCreateChart,
          hasFamilyChart,
          isConstructor,
          recommendedApproach: hasCreateChart ? 'createChart method' : 
                               hasFamilyChart ? 'FamilyChart constructor' :
                               isConstructor ? 'direct constructor' : 'unknown'
        }
      });

      // Step 5: Test data format expectations
      addAnalysisResult({
        name: 'Data Format Analysis',
        status: 'info',
        message: 'Analyzing expected data format...'
      });

      // Based on the GitHub documentation, the library expects:
      // - nodes array with id, name, gender, img, fid, mid, pids properties
      // - rootId to specify the starting node
      // - nodeBinding to map data fields to display fields

      const expectedDataFormat = {
        nodes: [
          {
            id: 'string',
            name: 'string', 
            gender: 'M' | 'F',
            img: 'string (optional)',
            fid: 'string (father id, optional)',
            mid: 'string (mother id, optional)',
            pids: 'string[] (partner ids, optional)'
          }
        ],
        rootId: 'string',
        nodeBinding: {
          field_0: 'string (name field)',
          img_0: 'string (image field)',
          field_1: 'string (additional field)'
        }
      };

      addAnalysisResult({
        name: 'Expected Data Format',
        status: 'success',
        message: 'Identified expected data format from documentation',
        details: {
          expectedFormat: expectedDataFormat,
          notes: [
            'Library expects nodes array with specific properties',
            'rootId should point to the starting node',
            'nodeBinding maps data fields to display fields',
            'Gender should be M/F, not male/female'
          ]
        }
      });

      // Step 6: Check our data transformation
      addAnalysisResult({
        name: 'Data Transformation Check',
        status: 'info',
        message: 'Checking our data transformation against expected format...'
      });

      // Test with sample data
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
        }
      ];

      // Import our transformation functions
      const { transformToSimpleFamilyData, findRootNode } = await import('@/utils/familyChartAdapter');
      
      const transformedData = transformToSimpleFamilyData(samplePersons, sampleConnections);
      const rootId = findRootNode(transformedData, samplePersons);

      addAnalysisResult({
        name: 'Data Transformation Test',
        status: 'success',
        message: `Successfully transformed ${transformedData.length} nodes`,
        details: {
          transformedData,
          rootId,
          formatCompliance: {
            hasId: transformedData.every(n => n.id),
            hasName: transformedData.every(n => n.name),
            hasGender: transformedData.every(n => n.gender === 'male' || n.gender === 'female'),
            hasCorrectGenderFormat: transformedData.every(n => n.gender === 'male' || n.gender === 'female'),
            hasPids: transformedData.every(n => Array.isArray(n.pids))
          }
        }
      });

      // Step 7: Identify potential issues
      addAnalysisResult({
        name: 'Potential Issues',
        status: 'warning',
        message: 'Identifying potential implementation issues...',
        details: {
          issues: [
            'Our gender format (male/female) may not match library expectations (M/F)',
            'Need to verify if library expects specific data structure',
            'May need to adjust nodeBinding configuration',
            'Should test with actual library methods to confirm API'
          ],
          recommendations: [
            'Test with actual library methods',
            'Verify gender format compatibility',
            'Check if library requires specific initialization',
            'Test different API signatures'
          ]
        }
      });

    } catch (error) {
      addAnalysisResult({
        name: 'Analysis Error',
        status: 'error',
        message: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Family Chart Library Analysis</CardTitle>
          <CardDescription>
            Deep analysis of the family-chart library API and our implementation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button 
              onClick={runLibraryAnalysis} 
              disabled={isAnalyzing}
              className="flex-1"
            >
              {isAnalyzing ? 'Analyzing...' : 'Run Library Analysis'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setAnalysisResults([])}
              disabled={isAnalyzing}
            >
              Clear Results
            </Button>
          </div>

          {libraryModule && (
            <Alert className="mb-4">
              <AlertDescription>
                <strong>Library Loaded:</strong> Type: {typeof libraryModule}, 
                Keys: {Object.keys(libraryModule).join(', ')}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="analysis" className="w-full">
            <TabsList>
              <TabsTrigger value="analysis">Analysis Results</TabsTrigger>
              <TabsTrigger value="documentation">Documentation</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="space-y-4">
              <div className="space-y-2">
                {analysisResults.map((result, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Badge 
                      variant={result.status === 'success' ? 'default' : 
                               result.status === 'warning' ? 'secondary' : 
                               result.status === 'error' ? 'destructive' : 'outline'}
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

            <TabsContent value="documentation">
              <Card>
                <CardHeader>
                  <CardTitle>GitHub Library Documentation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Library Overview</h4>
                    <p className="text-sm text-muted-foreground">
                      The family-chart library is a D3.js-based visualization library for creating family trees.
                      It provides example-based learning and full customization capabilities.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Expected API</h4>
                    <div className="text-sm space-y-2">
                      <p><strong>createChart(container, config)</strong></p>
                      <p><strong>config:</strong></p>
                      <ul className="ml-4 space-y-1">
                        <li>• nodes: Array of family members</li>
                        <li>• rootId: Starting node ID</li>
                        <li>• nodeBinding: Field mapping</li>
                        <li>• width/height: Chart dimensions</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Data Format</h4>
                    <div className="text-sm space-y-2">
                      <p><strong>Node Properties:</strong></p>
                      <ul className="ml-4 space-y-1">
                        <li>• id: Unique identifier</li>
                        <li>• name: Display name</li>
                        <li>• gender: M/F</li>
                        <li>• img: Profile image URL</li>
                        <li>• fid: Father ID</li>
                        <li>• mid: Mother ID</li>
                        <li>• pids: Partner IDs array</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations">
              <Card>
                <CardHeader>
                  <CardTitle>Implementation Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Immediate Actions</h4>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>• Test with actual library methods</li>
                      <li>• Verify gender format (M/F vs male/female)</li>
                      <li>• Check nodeBinding configuration</li>
                      <li>• Test different API signatures</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Data Transformation</h4>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>• Ensure gender is M/F format</li>
                      <li>• Verify all required fields are present</li>
                      <li>• Test with minimal data first</li>
                      <li>• Add proper error handling</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Library Integration</h4>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>• Try multiple API approaches</li>
                      <li>• Add comprehensive error logging</li>
                      <li>• Test with different data sizes</li>
                      <li>• Verify library version compatibility</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 