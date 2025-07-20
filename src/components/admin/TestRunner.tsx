import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react';

interface TestFile {
  name: string;
  path: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  tests?: number;
  passed?: number;
  failed?: number;
}

interface TestRunnerProps {
  isRunning: boolean;
}

export function TestRunner({ isRunning }: TestRunnerProps) {
  const [testFiles] = useState<TestFile[]>([
    {
      name: 'simple-test.tsx',
      path: 'src/test/components/simple-test.tsx',
      status: 'pending',
      tests: 1,
      passed: 0,
      failed: 0
    },
    {
      name: 'relationship-hierarchies.test.ts',
      path: 'src/test/relationship-hierarchies.test.ts',
      status: 'pending',
      tests: 8,
      passed: 0,
      failed: 0
    },
    {
      name: 'data-integrity.test.ts',
      path: 'src/test/integration/data-integrity.test.ts',
      status: 'pending',
      tests: 6,
      passed: 0,
      failed: 0
    }
  ]);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 300);

      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [isRunning]);

  const getStatusIcon = (status: TestFile['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />;
      default:
        return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: TestFile['status']) => {
    const variants = {
      pending: 'secondary',
      running: 'default',
      passed: 'default',
      failed: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status]} className="text-xs">
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {isRunning && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Test Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      <div className="space-y-3">
        {testFiles.map((file) => (
          <Card key={file.path} className="border-l-4 border-l-muted">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(file.status)}
                  <span className="font-mono">{file.name}</span>
                </div>
                {getStatusBadge(file.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground mb-2">
                {file.path}
              </div>
              <div className="flex gap-4 text-xs">
                <span>Tests: {file.tests}</span>
                {file.status !== 'pending' && (
                  <>
                    <span className="text-green-600">Passed: {file.passed}</span>
                    <span className="text-red-600">Failed: {file.failed}</span>
                    {file.duration && (
                      <span>Duration: {file.duration.toFixed(2)}s</span>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}