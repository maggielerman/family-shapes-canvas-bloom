import { supabase } from '@/integrations/supabase/client';
import { Person, CreatePersonData } from '@/types/person';
import { CreateDonorData } from '@/types/donor';
import { DonorService } from '@/services/donorService';

export class PersonService {
  /**
   * Create a new person
   */
  static async createPerson(personData: CreatePersonData): Promise<Person> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('No user found');

    console.log('Creating person with data:', personData);

    const { data, error } = await supabase
      .from('persons')
      .insert({
        ...personData,
        user_id: userData.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating person:', error);
      throw error;
    }
    
    console.log('Person created successfully:', data);
    return data as Person;
  }

  /**
   * Create a new person and add to a family tree
   */
  static async createPersonAndAddToTree(
    personData: CreatePersonData,
    familyTreeId: string
  ): Promise<Person> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('No user found');

    // Start a transaction-like operation
    const { data: person, error: personError } = await supabase
      .from('persons')
      .insert({
        ...personData,
        user_id: userData.user.id,
      })
      .select()
      .single();

    if (personError) throw personError;

    // Add person to the family tree
    const { error: treeError } = await supabase
      .from('family_tree_members')
      .insert({
        family_tree_id: familyTreeId,
        person_id: person.id,
        added_by: userData.user.id,
        role: 'member',
      });

    if (treeError) throw treeError;

    return person as Person;
  }

  /**
   * Create a person as a donor (creates both person and donor records)
   */
  static async createPersonAsDonor(
    personData: CreatePersonData,
    donorData: CreateDonorData,
    familyTreeId?: string
  ): Promise<{ person: Person; donor: any }> {
    // Use the DonorService to handle the creation
    if (familyTreeId) {
      // First create the person and add to tree
      const person = await this.createPersonAndAddToTree(personData, familyTreeId);
      
      // Then create the donor record
      const donor = await DonorService.createDonor({
        ...donorData,
        person_id: person.id,
      });
      
      return { person, donor };
    } else {
      // Create person first
      const person = await this.createPerson(personData);
      
      // Then create the donor record
      const donor = await DonorService.createDonor({
        ...donorData,
        person_id: person.id,
      });
      
      return { person, donor };
    }
  }

  /**
   * Get all persons for a user
   */
  static async getPersons(): Promise<Person[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('No user found');

    const { data, error } = await supabase
      .from('persons')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Person[];
  }

  /**
   * Get person by ID
   */
  static async getPersonById(id: string): Promise<Person | null> {
    const { data, error } = await supabase
      .from('persons')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Person | null;
  }

  /**
   * Update person
   */
  static async updatePerson(id: string, updateData: Partial<CreatePersonData>): Promise<Person> {
    const { data, error } = await supabase
      .from('persons')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Person;
  }

  /**
   * Delete person
   */
  static async deletePerson(id: string): Promise<void> {
    // Delete donor record first (if person is a donor)
    await supabase
      .from('donors')
      .delete()
      .eq('person_id', id);

    // Delete the person
    const { error } = await supabase
      .from('persons')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}