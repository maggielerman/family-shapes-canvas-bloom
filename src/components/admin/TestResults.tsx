import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CheckCircle, XCircle, Clock, TrendingUp, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface FailedTest {
  name: string;
  file: string;
  error: string;
  stack?: string;
}

interface TestResultsProps {
  results: {
    total: number;
    passed: number;
    failed: number;
    duration: number;
    failedTests?: FailedTest[];
  } | null;
}

export function TestResults({ results }: TestResultsProps) {
  const [expandedTests, setExpandedTests] = useState<Set<number>>(new Set());
  if (!results) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No test results available. Run tests to see results here.</p>
        </CardContent>
      </Card>
    );
  }

  const successRate = Math.round((results.passed / results.total) * 100);

  const toggleTest = (index: number) => {
    const newExpanded = new Set(expandedTests);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedTests(newExpanded);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{results.passed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{results.failed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.duration}s</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Test Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Success Rate</span>
            <Badge variant={successRate >= 90 ? 'default' : successRate >= 70 ? 'secondary' : 'destructive'}>
              {successRate}%
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Passed Tests</span>
              <span className="font-mono">{results.passed}/{results.total}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(results.passed / results.total) * 100}%` }}
              />
            </div>
          </div>

          {results.failed > 0 && results.failedTests && (
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                Failed Tests ({results.failed})
              </h4>
              <div className="space-y-3">
                {results.failedTests.map((test, index) => (
                  <Collapsible key={index}>
                    <CollapsibleTrigger
                      onClick={() => toggleTest(index)}
                      className="w-full p-3 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-left">
                          {expandedTests.has(index) ? (
                            <ChevronDown className="w-4 h-4 text-red-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-red-600" />
                          )}
                          <div>
                            <div className="font-medium text-red-800">
                              {test.name}
                            </div>
                            <div className="text-xs text-red-600">
                              {test.file}
                            </div>
                          </div>
                        </div>
                        <Badge variant="destructive" className="text-xs">
                          Failed
                        </Badge>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-red-800 mb-2">
                            Error Message:
                          </h5>
                          <div className="text-sm text-red-700 font-mono bg-red-100 p-2 rounded border">
                            {test.error}
                          </div>
                        </div>
                        {test.stack && (
                          <div>
                            <h5 className="text-sm font-medium text-red-800 mb-2">
                              Stack Trace:
                            </h5>
                            <div className="text-xs text-red-600 font-mono bg-red-100 p-2 rounded border max-h-40 overflow-y-auto">
                              <pre className="whitespace-pre-wrap">{test.stack}</pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}