import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseConnectionCreatorProps {
  familyTreeId: string;
  onConnectionAdded: () => void;
}

export function useConnectionCreator({ familyTreeId, onConnectionAdded }: UseConnectionCreatorProps) {
  const [draggedPersonId, setDraggedPersonId] = useState<string | null>(null);
  const [hoveredPersonId, setHoveredPersonId] = useState<string | null>(null);
  const [isCreatingConnection, setIsCreatingConnection] = useState(false);
  const { toast } = useToast();

  const handleDragStart = useCallback((personId: string) => {
    setDraggedPersonId(personId);
    setIsCreatingConnection(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedPersonId(null);
    setHoveredPersonId(null);
    setIsCreatingConnection(false);
  }, []);

  const handleDragOver = useCallback((personId: string) => {
    if (draggedPersonId && draggedPersonId !== personId) {
      setHoveredPersonId(personId);
    }
  }, [draggedPersonId]);

  const handleDragLeave = useCallback(() => {
    setHoveredPersonId(null);
  }, []);

  const createConnection = useCallback(async (
    fromPersonId: string, 
    toPersonId: string, 
    relationshipType: string
  ) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('No user found');

      const { error } = await supabase
        .from('connections')
        .insert({
          from_person_id: fromPersonId,
          to_person_id: toPersonId,
          relationship_type: relationshipType,
          family_tree_id: familyTreeId,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Connection created successfully",
      });

      onConnectionAdded();
      return true;
    } catch (error) {
      console.error('Error creating connection:', error);
      toast({
        title: "Error",
        description: "Failed to create connection",
        variant: "destructive",
      });
      return false;
    }
  }, [familyTreeId, onConnectionAdded, toast]);


  return {
    draggedPersonId,
    hoveredPersonId,
    isCreatingConnection,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    createConnection,
  };
}