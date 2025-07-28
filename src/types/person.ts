/**
 * Centralized Person interface that matches the database schema
 * Based on the persons table structure
 */

export interface Person {
  // Primary key
  id: string;
  
  // Basic information
  name: string;
  date_of_birth?: string | null; // Date in YYYY-MM-DD format
  birth_place?: string | null;
  gender?: string | null;
  status: string; // 'living' | 'deceased' - required field with default 'living'
  date_of_death?: string | null; // Date in YYYY-MM-DD format
  death_place?: string | null;
  
  // Contact information
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  preferred_contact_method?: 'email' | 'phone' | 'mail' | 'none' | null;
  social_media_links?: any | null; // JSONB field
  
  // Profile
  profile_photo_url?: string | null;
  
  // Fertility and medical information
  used_ivf?: boolean | null;
  used_iui?: boolean | null;
  fertility_treatments?: any | null; // JSONB field
  donor?: boolean | null;
  
  // Additional information
  notes?: string | null;
  metadata?: any | null; // JSONB field
  
  // Relationships
  user_id?: string | null;
  organization_id?: string | null;
  is_self?: boolean | null;
  
  // Timestamps
  created_at: string;
  updated_at?: string | null;
  
  // Family tree specific fields (not in database, but used in UI)
  family_tree_id?: string | null;
  membership_role?: string | null;
}

/**
 * Type for creating a new person (omits auto-generated fields)
 */
export type CreatePersonData = Omit<Person, 'id' | 'created_at' | 'updated_at'>;

/**
 * Type for updating a person (all fields optional except id)
 */
export type UpdatePersonData = Partial<Omit<Person, 'id' | 'created_at' | 'updated_at'>> & {
  id: string;
};

/**
 * Utility functions for working with Person data
 */
export const PersonUtils = {
  /**
   * Get person's age based on birth date
   */
  getAge: (person: Person): number | null => {
    if (!person.date_of_birth) return null;
    
    const birthDate = new Date(person.date_of_birth);
    const today = new Date();
    
    if (isNaN(birthDate.getTime())) return null;
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  },

  /**
   * Get person's initials from name
   */
  getInitials: (person: Person): string => {
    return person.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  },

  /**
   * Check if person is deceased
   */
  isDeceased: (person: Person): boolean => {
    return person.status === 'deceased';
  },

  /**
   * Check if person is living
   */
  isLiving: (person: Person): boolean => {
    return person.status === 'living' || !person.status;
  },

  /**
   * Get display name with status indicator
   */
  getDisplayName: (person: Person): string => {
    if (PersonUtils.isDeceased(person)) {
      return `${person.name} (Deceased)`;
    }
    return person.name;
  },

  /**
   * Get fertility treatment summary
   */
  getFertilitySummary: (person: Person): string[] => {
    const treatments: string[] = [];
    
    if (person.used_ivf) treatments.push('IVF');
    if (person.used_iui) treatments.push('IUI');
    
    return treatments;
  },

  /**
   * Check if person is a donor (has donor record)
   */
  isDonor: (person: Person): boolean => {
    return person.donor === true;
  },

  /**
   * Get donor information (if person is a donor)
   */
  getDonorInfo: async (person: Person): Promise<any | null> => {
    if (!person.donor) return null;
    
    // This would need to be implemented with actual Supabase query
    // For now, return null - this should be implemented in a service layer
    // The actual implementation is in usePersonManagement hook
    return null;
  }
}; 