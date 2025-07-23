import { useState } from 'react';
import { PersonService } from '@/services/personService';
import { DonorService } from '@/services/donorService';
import { CreatePersonData } from '@/types/person';
import { CreateDonorData } from '@/types/donor';
import { useToast } from '@/hooks/use-toast';

interface UsePersonManagementOptions {
  familyTreeId?: string;
  onPersonAdded?: () => void;
  onDonorAdded?: () => void;
}

export function usePersonManagement(options: UsePersonManagementOptions = {}) {
  const { familyTreeId, onPersonAdded, onDonorAdded } = options;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPerson = async (personData: CreatePersonData) => {
    setIsSubmitting(true);
    try {
      if (familyTreeId) {
        await PersonService.createPersonAndAddToTree(personData, familyTreeId);
      } else {
        await PersonService.createPerson(personData);
      }
      
      toast({
        title: "Success",
        description: "Person added successfully",
      });
      
      onPersonAdded?.();
    } catch (error) {
      console.error('Error adding person:', error);
      toast({
        title: "Error",
        description: "Failed to add person",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDonor = async (personData: CreatePersonData, donorData: CreateDonorData) => {
    setIsSubmitting(true);
    try {
      await DonorService.createPersonAsDonor(personData, donorData);
      
      toast({
        title: "Success",
        description: "Donor added successfully",
      });
      
      onDonorAdded?.();
    } catch (error) {
      console.error('Error adding donor:', error);
      toast({
        title: "Error",
        description: "Failed to add donor",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleAddPerson,
    handleAddDonor,
    isSubmitting
  };
} 