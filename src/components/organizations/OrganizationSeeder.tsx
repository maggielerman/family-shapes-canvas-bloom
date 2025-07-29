import { useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Database, 
  Play, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Users,
  Building2,
  Link as LinkIcon
} from "lucide-react";
import { seedOrganizations, clearSeededData } from "@/lib/organizationSeeds";

export function OrganizationSeeder() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [seedResults, setSeedResults] = useState<any>(null);

  const handleSeed = async () => {
    if (!user) return;

    setIsSeeding(true);
    setSeedResults(null);

    try {
      // @ts-ignore - Function signature mismatch
      const results = await seedOrganizations(user.id);
      setSeedResults(results);

      toast({
        title: "Seeding Complete!",
        description: `Created ${results.organizations.length} organizations with sample data`
      });
    } catch (error) {
      console.error('Seeding error:', error);
      toast({
        title: "Seeding Failed",
        description: "There was an error seeding the database",
        variant: "destructive"
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClear = async () => {
    if (!user) return;

    setIsClearing(true);

    try {
      // @ts-ignore - Function signature mismatch
      await clearSeededData(user.id);
      setSeedResults(null);

      toast({
        title: "Data Cleared",
        description: "All seeded data has been removed"
      });
    } catch (error) {
      console.error('Clear error:', error);
      toast({
        title: "Clear Failed",
        description: "There was an error clearing the data",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Organization Test Data Seeder
        </CardTitle>
        <CardDescription>
          Generate realistic test data for organizations, groups, members, and relationships to test functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seeder Controls */}
        <div className="flex gap-3">
          <Button 
            onClick={handleSeed}
            disabled={isSeeding || isClearing}
            className="flex items-center gap-2"
          >
            {isSeeding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Seeding...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Seed Test Data
              </>
            )}
          </Button>
          
          <Button 
            variant="destructive"
            onClick={handleClear}
            disabled={isSeeding || isClearing}
            className="flex items-center gap-2"
          >
            {isClearing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Clear All Data
              </>
            )}
          </Button>
        </div>

        {/* What will be created */}
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            <strong>This will create:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• 4 different types of organizations (clinic, sperm bank, family, registry)</li>
              <li>• Groups within each organization (sibling groups, cohorts, etc.)</li>
              <li>• Sample people with realistic family relationships</li>
              <li>• Donor conception relationships and half-siblings</li>
              <li>• Multi-generational family structures</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Results Display */}
        {seedResults && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Seeding Results
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <Building2 className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{seedResults.organizations.length}</div>
                <div className="text-xs text-muted-foreground">Organizations</div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{seedResults.groups.length}</div>
                <div className="text-xs text-muted-foreground">Groups</div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{seedResults.persons.length}</div>
                <div className="text-xs text-muted-foreground">People</div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <LinkIcon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{seedResults.connections.length}</div>
                <div className="text-xs text-muted-foreground">Connections</div>
              </div>
            </div>

            {/* Organizations Created */}
            <div>
              <h5 className="font-medium mb-2">Organizations Created:</h5>
              <div className="flex flex-wrap gap-2">
                {seedResults.organizations.map((org: any) => (
                  <Badge key={org.id} variant="outline">
                    {org.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Errors */}
            {seedResults.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Errors encountered:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    {seedResults.errors.slice(0, 5).map((error: string, index: number) => (
                      <li key={index}>• {error}</li>
                    ))}
                    {seedResults.errors.length > 5 && (
                      <li>• ... and {seedResults.errors.length - 5} more errors</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Instructions */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> This is for testing purposes only. The seeded data includes:
            realistic family structures with donor conception relationships, multiple organization types,
            and complex family trees. Use "Clear All Data" to remove all seeded content when done testing.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}