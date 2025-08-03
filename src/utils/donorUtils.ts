import { supabase } from '@/integrations/supabase/client';

/**
 * Utility functions for donor operations that properly handle the relationship
 * between users, persons, and donor_profiles tables
 */

/**
 * Get person ID from user ID
 * @param userId - The Supabase auth user ID
 * @returns The person ID or null if not found
 */
export async function getPersonIdFromUserId(userId: string): Promise<string | null> {
  try {
    console.log('🔍 Getting person ID for user:', userId);
    const { data, error } = await supabase
      .from('persons')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching person ID:', error);
      return null;
    }

    console.log('✅ Person ID found:', data?.id);
    return data?.id || null;
  } catch (error) {
    console.error('Error in getPersonIdFromUserId:', error);
    return null;
  }
}

/**
 * Get donor data by user ID
 * This function properly fetches the donor profile from donor_profiles table
 * @param userId - The Supabase auth user ID
 * @returns The donor data or null if not found
 */
export async function getDonorByUserId(userId: string) {
  try {
    console.log('🔍 Getting donor data for user:', userId);
    const { data, error } = await supabase
      .from('donor_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching donor data:', error);
      return null;
    }

    console.log('✅ Donor data found');
    return data;
  } catch (error) {
    console.error('Error in getDonorByUserId:', error);
    return null;
  }
}

/**
 * Update donor data by user ID
 * This function updates the donor_profiles table
 * @param userId - The Supabase auth user ID
 * @param updates - The data to update
 * @returns Success boolean
 */
export async function updateDonorByUserId(userId: string, updates: any) {
  try {
    console.log('🔍 Updating donor data for user:', userId);
    const { error } = await supabase
      .from('donor_profiles')
      .update(updates)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating donor data:', error);
      return false;
    }

    console.log('✅ Donor data updated successfully');
    return true;
  } catch (error) {
    console.error('Error in updateDonorByUserId:', error);
    return false;
  }
}