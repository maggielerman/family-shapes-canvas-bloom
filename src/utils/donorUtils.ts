import { supabase } from '@/integrations/supabase/client';

/**
 * Utility functions for donor operations that properly handle the relationship
 * between users, persons, and donors tables
 */

/**
 * Get person ID from user ID
 * @param userId - The Supabase auth user ID
 * @returns The person ID or null if not found
 */
export async function getPersonIdFromUserId(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('persons')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching person ID:', error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Error in getPersonIdFromUserId:', error);
    return null;
  }
}

/**
 * Get donor data by user ID
 * This function properly fetches the person ID first, then queries the donors table
 * @param userId - The Supabase auth user ID
 * @returns The donor data or null if not found
 */
export async function getDonorByUserId(userId: string) {
  const personId = await getPersonIdFromUserId(userId);
  if (!personId) return null;

  try {
    const { data, error } = await supabase
      .from('donors')
      .select('*')
      .eq('person_id', personId)
      .single();

    if (error) {
      console.error('Error fetching donor data:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getDonorByUserId:', error);
    return null;
  }
}

/**
 * Update donor data by user ID
 * This function properly fetches the person ID first, then updates the donors table
 * @param userId - The Supabase auth user ID
 * @param updates - The data to update
 * @returns Success boolean
 */
export async function updateDonorByUserId(userId: string, updates: any) {
  const personId = await getPersonIdFromUserId(userId);
  if (!personId) return false;

  try {
    const { error } = await supabase
      .from('donors')
      .update(updates)
      .eq('person_id', personId);

    if (error) {
      console.error('Error updating donor data:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateDonorByUserId:', error);
    return false;
  }
}