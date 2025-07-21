import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { runCleanup } from '../family-trees/utils/cleanupDuplicates';

export function DuplicateCleanup() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleCleanup = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      await runCleanup();
      setResult({
        success: true,
        message: 'Duplicate connections cleaned up successfully!'
      });
    } catch (error) {
      console.error('Cleanup error:', error);
      setResult({
        success: false,
        message: 'Error during cleanup. Check console for details.'
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Duplicate Connection Cleanup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>This tool will clean up duplicate connections in your family trees.</p>
          <p className="mt-2">
            <strong>What it does:</strong>
          </p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Removes duplicate sibling relationships (e.g., A→B and B→A)</li>
            <li>Removes duplicate partner/spouse relationships</li>
            <li>Standardizes connection directions</li>
            <li>Preserves parent-child relationships as directional</li>
          </ul>
        </div>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            {result.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleCleanup} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Cleanup...
            </>
          ) : (
            'Run Cleanup'
          )}
        </Button>

        <div className="text-xs text-muted-foreground">
          <p><strong>Note:</strong> This operation is irreversible. Make sure to backup your data first.</p>
        </div>
      </CardContent>
    </Card>
  );
} 