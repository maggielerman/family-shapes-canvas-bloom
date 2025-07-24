import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const DatabaseTest = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);

    addResult('Starting database tests...');

    // Test 1: Basic authentication
    addResult(`User ID: ${user?.id || 'No user'}`);
    addResult(`User Email: ${user?.email || 'No email'}`);

    if (!user) {
      addResult('ERROR: No authenticated user found');
      setLoading(false);
      return;
    }

    try {
      // Test 2: Test family_trees table access
      addResult('Testing family_trees table access...');
      const { data: treesData, error: treesError } = await supabase
        .from('family_trees')
        .select('*')
        .limit(1);
      
      if (treesError) {
        addResult(`ERROR family_trees: ${treesError.message}`);
      } else {
        addResult(`SUCCESS family_trees: Found ${treesData?.length || 0} records`);
      }

      // Test 3: Test user_profiles table access
      addResult('Testing user_profiles table access...');
      const { data: profileData, error: profileError, count } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact' })
        .eq('id', user.id);
      
      if (profileError) {
        addResult(`ERROR user_profiles: ${profileError.message} (Code: ${profileError.code})`);
      } else {
        addResult(`SUCCESS user_profiles: Found ${count || profileData?.length || 0} profile records`);
        if (profileData && profileData.length > 1) {
          addResult(`WARNING: Multiple profiles found (${profileData.length}) - using most recent`);
        }
        if (profileData && profileData.length > 0) {
          addResult(`First profile name: ${profileData[0]?.full_name || 'No name'}`);
        }
      }

      // Test 4: Test family_tree_members table access
      addResult('Testing family_tree_members table access...');
      const { data: membersData, error: membersError } = await supabase
        .from('family_tree_members')
        .select('*')
        .limit(1);
      
      if (membersError) {
        addResult(`ERROR family_tree_members: ${membersError.message}`);
      } else {
        addResult(`SUCCESS family_tree_members: Found ${membersData?.length || 0} records`);
      }

      // Test 5: Test connections table access
      addResult('Testing connections table access...');
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('connections')
        .select('*')
        .limit(1);
      
      if (connectionsError) {
        addResult(`ERROR connections: ${connectionsError.message}`);
      } else {
        addResult(`SUCCESS connections: Found ${connectionsData?.length || 0} records`);
      }

      // Test 5b: Test connections with joins (this is where it might fail)
      addResult('Testing connections with person joins...');
      const { data: joinData, error: joinError } = await supabase
        .from('connections')
        .select(`
          *,
          from_person:persons(name),
          to_person:persons(name)
        `)
        .limit(1);
      
      if (joinError) {
        addResult(`ERROR connections join: ${joinError.message}`);
        addResult(`Join error code: ${joinError.code}`);
        addResult(`Join error details: ${joinError.details}`);
        addResult(`Join error hint: ${joinError.hint}`);
      } else {
        addResult(`SUCCESS connections join: Found ${joinData?.length || 0} records with person data`);
      }

      // Test 5c: Test alternative connection query format
      addResult('Testing alternative connection query...');
      const { data: altData, error: altError } = await supabase
        .from('connections')
        .select(`
          id,
          from_person_id,
          to_person_id,
          relationship_type,
          family_tree_id
        `)
        .limit(1);
      
      if (altError) {
        addResult(`ERROR alt connections: ${altError.message}`);
      } else {
        addResult(`SUCCESS alt connections: Found ${altData?.length || 0} records`);
        if (altData && altData.length > 0) {
          addResult(`Sample connection: ${altData[0].relationship_type} (${altData[0].from_person_id} -> ${altData[0].to_person_id})`);
        }
      }

      // Test 6: Test current user session
      addResult('Testing current session...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        addResult(`ERROR session: ${sessionError.message}`);
      } else {
        addResult(`SUCCESS session: ${sessionData.session ? 'Active session' : 'No session'}`);
      }

    } catch (error) {
      addResult(`FATAL ERROR: ${error}`);
    }

    addResult('Database tests completed.');
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Database Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={loading}>
          {loading ? 'Running Tests...' : 'Run Database Tests'}
        </Button>
        
        <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
          <div className="font-mono text-sm space-y-1">
            {testResults.length === 0 ? (
              <div className="text-gray-500">Click "Run Database Tests" to start</div>
            ) : (
              testResults.map((result, index) => (
                <div 
                  key={index} 
                  className={`${
                    result.includes('ERROR') ? 'text-red-600' : 
                    result.includes('SUCCESS') ? 'text-green-600' : 
                    'text-gray-700'
                  }`}
                >
                  {result}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};