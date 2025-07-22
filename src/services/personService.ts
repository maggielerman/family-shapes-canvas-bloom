import { supabase } from '@/integrations/supabase/client';
import { Person, CreatePersonData } from '@/types/person';

export class PersonService {
  /**
   * Create a new person
   */
  static async createPerson(personData: CreatePersonData): Promise<Person> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('No user found');

    const { data: newPerson, error } = await supabase
      .from('persons')
      .insert({
        ...personData,
        user_id: userData.user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return newPerson as Person;
  }

  /**
   * Add a person to a family tree
   */
  static async addPersonToFamilyTree(personId: string, familyTreeId: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('No user found');

    const { error } = await supabase
      .from('family_tree_members')
      .insert({
        family_tree_id: familyTreeId,
        person_id: personId,
        added_by: userData.user.id,
        role: 'member',
      });

    if (error) throw error;
  }

  /**
   * Create a person and add them to a family tree in one operation
   */
  static async createPersonAndAddToTree(
    personData: CreatePersonData, 
    familyTreeId: string
  ): Promise<Person> {
    const person = await this.createPerson(personData);
    await this.addPersonToFamilyTree(person.id, familyTreeId);
    return person;
  }

  /**
   * Remove a person from a family tree
   */
  static async removePersonFromFamilyTree(personId: string, familyTreeId: string): Promise<void> {
    const { error } = await supabase
      .from('family_tree_members')
      .delete()
      .eq('person_id', personId)
      .eq('family_tree_id', familyTreeId);

    if (error) throw error;
  }

  /**
   * Get all persons in a family tree
   */
  static async getPersonsInFamilyTree(familyTreeId: string): Promise<Person[]> {
    const { data, error } = await supabase
      .from('family_tree_members')
      .select(`
        person:persons(*)
      `)
      .eq('family_tree_id', familyTreeId);

    if (error) throw error;
    return (data || []).map(member => member.person) as Person[];
  }

  /**
   * Update a person
   */
  static async updatePerson(personId: string, updates: Partial<CreatePersonData>): Promise<Person> {
    const { data, error } = await supabase
      .from('persons')
      .update(updates)
      .eq('id', personId)
      .select()
      .single();

    if (error) throw error;
    return data as Person;
  }

  /**
   * Delete a person
   */
  static async deletePerson(personId: string): Promise<void> {
    const { error } = await supabase
      .from('persons')
      .delete()
      .eq('id', personId);

    if (error) throw error;
  }
}