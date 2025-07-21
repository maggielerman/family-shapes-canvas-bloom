import { supabase } from '@/integrations/supabase/client';
import { Donor, CreateDonorData, UpdateDonorData } from '@/types/donor';
import { Person } from '@/types/person';

/**
 * Service for handling donor operations
 */
export class DonorService {
  /**
   * Create a new donor and link to a person
   */
  static async createDonor(donorData: CreateDonorData): Promise<Donor> {
    const { data, error } = await supabase
      .from('donors')
      .insert(donorData)
      .select()
      .single();

    if (error) throw error;
    return data as Donor;
  }

  /**
   * Get donor by ID
   */
  static async getDonorById(id: string): Promise<Donor | null> {
    const { data, error } = await supabase
      .from('donors')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Donor | null;
  }

  /**
   * Get donor by person ID
   */
  static async getDonorByPersonId(personId: string): Promise<Donor | null> {
    const { data, error } = await supabase
      .from('donors')
      .select('*')
      .eq('person_id', personId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data as Donor | null;
  }

  /**
   * Update donor
   */
  static async updateDonor(updateData: UpdateDonorData): Promise<Donor> {
    const { id, ...data } = updateData;
    const { data: updatedDonor, error } = await supabase
      .from('donors')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updatedDonor as Donor;
  }

  /**
   * Delete donor
   */
  static async deleteDonor(id: string): Promise<void> {
    const { error } = await supabase
      .from('donors')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Create a person as a donor (creates both person and donor records)
   */
  static async createPersonAsDonor(
    personData: any,
    donorData: CreateDonorData
  ): Promise<{ person: Person; donor: Donor }> {
    // Start a transaction-like operation
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('No user found');

    // First create the person
    const { data: person, error: personError } = await supabase
      .from('persons')
      .insert({
        ...personData,
        user_id: userData.user.id,
        donor: true, // Mark as donor
      })
      .select()
      .single();

    if (personError) throw personError;

    // Then create the donor record linked to the person
    const { data: donor, error: donorError } = await supabase
      .from('donors')
      .insert({
        ...donorData,
        person_id: person.id,
      })
      .select()
      .single();

    if (donorError) {
      // If donor creation fails, we should clean up the person record
      await supabase.from('persons').delete().eq('id', person.id);
      throw donorError;
    }

    return { person: person as Person, donor: donor as Donor };
  }

  /**
   * Convert existing person to donor
   */
  static async convertPersonToDonor(
    personId: string,
    donorData: CreateDonorData
  ): Promise<Donor> {
    // Update person to mark as donor
    const { error: personError } = await supabase
      .from('persons')
      .update({ donor: true })
      .eq('id', personId);

    if (personError) throw personError;

    // Create donor record
    const { data: donor, error: donorError } = await supabase
      .from('donors')
      .insert({
        ...donorData,
        person_id: personId,
      })
      .select()
      .single();

    if (donorError) throw donorError;
    return donor as Donor;
  }

  /**
   * Remove donor status from person
   */
  static async removeDonorStatus(personId: string): Promise<void> {
    // Delete donor record
    const { error: donorError } = await supabase
      .from('donors')
      .delete()
      .eq('person_id', personId);

    if (donorError) throw donorError;

    // Update person to remove donor flag
    const { error: personError } = await supabase
      .from('persons')
      .update({ donor: false })
      .eq('id', personId);

    if (personError) throw personError;
  }

  /**
   * Get all donors with their associated person data
   */
  static async getAllDonors(): Promise<(Donor & { person: Person })[]> {
    const { data, error } = await supabase
      .from('donors')
      .select(`
        *,
        person:persons(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as (Donor & { person: Person })[];
  }

  /**
   * Search donors by various criteria
   */
  static async searchDonors(criteria: {
    donor_type?: string;
    is_anonymous?: boolean;
    sperm_bank?: string;
    ethnicity?: string;
  }): Promise<Donor[]> {
    let query = supabase.from('donors').select('*');

    if (criteria.donor_type) {
      query = query.eq('donor_type', criteria.donor_type);
    }
    if (criteria.is_anonymous !== undefined) {
      query = query.eq('is_anonymous', criteria.is_anonymous);
    }
    if (criteria.sperm_bank) {
      query = query.ilike('sperm_bank', `%${criteria.sperm_bank}%`);
    }
    if (criteria.ethnicity) {
      query = query.ilike('ethnicity', `%${criteria.ethnicity}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Donor[];
  }
} 