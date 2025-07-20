import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FileText, Shield, Zap } from 'lucide-react';

const mockCoverageData = {
  overall: 78,
  statements: 82,
  branches: 74,
  functions: 85,
  lines: 80,
  files: [
    { name: 'AuthContext.tsx', path: 'src/components/auth/AuthContext.tsx', coverage: 95 },
    { name: 'FamilyTreeVisualization.tsx', path: 'src/components/family-trees/FamilyTreeVisualization.tsx', coverage: 45 },
    { name: 'PersonCard.tsx', path: 'src/components/people/PersonCard.tsx', coverage: 88 },
    { name: 'ConnectionManager.tsx', path: 'src/components/family-trees/ConnectionManager.tsx', coverage: 32 },
    { name: 'OrganizationDashboard.tsx', path: 'src/components/organizations/OrganizationDashboard.tsx', coverage: 67 }
  ]
};

export function TestCoverage() {
  const getCoverageColor = (coverage: number) => {
    if (coverage >= 80) return 'text-green-600';
    if (coverage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCoverageBadge = (coverage: number) => {
    if (coverage >= 80) return 'default';
    if (coverage >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCoverageData.overall}%</div>
            <Progress value={mockCoverageData.overall} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Statements</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCoverageData.statements}%</div>
            <Progress value={mockCoverageData.statements} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Branches</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCoverageData.branches}%</div>
            <Progress value={mockCoverageData.branches} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Functions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCoverageData.functions}%</div>
            <Progress value={mockCoverageData.functions} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>File Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockCoverageData.files.map((file) => (
              <div key={file.path} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-sm">{file.name}</div>
                  <div className="text-xs text-muted-foreground">{file.path}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24">
                    <Progress value={file.coverage} className="h-2" />
                  </div>
                  <Badge variant={getCoverageBadge(file.coverage) as any}>
                    {file.coverage}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coverage Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
              <div>
                <div className="font-medium">Low Coverage Files</div>
                <div className="text-muted-foreground">
                  ConnectionManager.tsx (32%) and FamilyTreeVisualization.tsx (45%) need more test coverage.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
              <div>
                <div className="font-medium">Focus Areas</div>
                <div className="text-muted-foreground">
                  Add integration tests for family tree operations and connection management.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}