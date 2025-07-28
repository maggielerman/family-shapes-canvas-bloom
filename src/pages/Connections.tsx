import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/components/auth/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { ConnectionService } from '@/services/connectionService';
import { Loader2, UserPlus, Users, UserCheck, UserX } from 'lucide-react';

const Connections: React.FC = () => {
  const { user } = useAuth();

  const { data: connections, isLoading, error } = useQuery({
    queryKey: ['connections', user?.id],
    queryFn: () => ConnectionService.getConnections(),
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Error loading connections</h3>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Connections</h1>
          <p className="text-muted-foreground">
            Manage your family connections and relationships
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Connection
        </Button>
      </div>

      <Separator />

      <div className="grid gap-6">
        {connections && connections.length > 0 ? (
          connections.map((connection) => (
            <Card key={connection.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-coral-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-coral-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {connection.name || 'Unknown Connection'}
                      </CardTitle>
                      <CardDescription>
                        {connection.email || 'No email provided'}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={connection.status === 'active' ? 'default' : 'secondary'}>
                    {connection.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {connection.relationship && (
                    <div className="flex items-center space-x-2">
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Relationship: {connection.relationship}
                      </span>
                    </div>
                  )}
                  {connection.organization && (
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Organization: {connection.organization}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No connections yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Start building your family network by adding connections
              </p>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Your First Connection
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Connections;