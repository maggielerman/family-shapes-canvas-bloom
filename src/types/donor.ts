/**
 * Centralized Donor interface that matches the database schema
 * Based on the donors table structure
 */

export interface Donor {
  // Primary key
  id: string;
  
  // Donor identification
  donor_number?: string | null;
  sperm_bank?: string | null;
  donor_type?: 'sperm' | 'egg' | 'embryo' | 'other' | null;
  is_anonymous?: boolean | null;
  
  // Physical characteristics
  height?: string | null;
  weight?: string | null;
  eye_color?: string | null;
  hair_color?: string | null;
  ethnicity?: string | null;
  blood_type?: string | null;
  
  // Additional information
  education_level?: string | null;
  medical_history?: any | null; // JSONB field
  notes?: string | null;
  metadata?: any | null; // JSONB field
  
  // Relationships
  person_id?: string | null; // Links to the Person who is the donor
  
  // Timestamps
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Type for creating a new donor (omits auto-generated fields)
 */
export type CreateDonorData = Omit<Donor, 'id' | 'created_at' | 'updated_at'>;

/**
 * Type for updating a donor (all fields optional except id)
 */
export type UpdateDonorData = Partial<Omit<Donor, 'id' | 'created_at' | 'updated_at'>> & {
  id: string;
};

/**
 * Utility functions for working with Donor data
 */
export const DonorUtils = {
  /**
   * Get donor type display label
   */
  getDonorTypeLabel: (donorType?: string | null): string => {
    switch (donorType) {
      case 'sperm': return 'Sperm Donor';
      case 'egg': return 'Egg Donor';
      case 'embryo': return 'Embryo Donor';
      case 'other': return 'Other Donor';
      default: return 'Unknown Type';
    }
  },

  /**
   * Get donor anonymity status
   */
  getAnonymityStatus: (isAnonymous?: boolean | null): string => {
    return isAnonymous ? 'Anonymous' : 'Known';
  },

  /**
   * Get donor summary for display
   */
  getDonorSummary: (donor: Donor): string[] => {
    const summary: string[] = [];
    
    if (donor.donor_type) {
      summary.push(DonorUtils.getDonorTypeLabel(donor.donor_type));
    }
    
    if (donor.is_anonymous !== null) {
      summary.push(DonorUtils.getAnonymityStatus(donor.is_anonymous));
    }
    
    if (donor.sperm_bank) {
      summary.push(`Bank: ${donor.sperm_bank}`);
    }
    
    if (donor.donor_number) {
      summary.push(`#${donor.donor_number}`);
    }
    
    return summary;
  },

  /**
   * Check if donor is anonymous
   */
  isAnonymous: (donor: Donor): boolean => {
    return donor.is_anonymous === true;
  },

  /**
   * Check if donor is known
   */
  isKnown: (donor: Donor): boolean => {
    return donor.is_anonymous === false;
  }
}; 