import { supabase } from '@/integrations/supabase/client';

interface DonorSignupData {
  email: string;
  password: string;
  fullName: string;
  donorNumber?: string;
  cryobankName?: string;
  donorType: 'sperm' | 'egg' | 'embryo' | 'other';
  isAnonymous: boolean;
  consentToContact: boolean;
}

export const donorAuthService = {
  /**
   * Create a donor account with profile
   */
  async signUpDonor(data: DonorSignupData) {
    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            user_type: 'donor'
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // Step 2: Create person record
      const { data: personData, error: personError } = await supabase
        .from('persons')
        .insert({
          user_id: authData.user.id,
          first_name: data.fullName.split(' ')[0],
          last_name: data.fullName.split(' ').slice(1).join(' ') || '',
          email: data.email,
          person_type: 'donor'
        })
        .select()
        .single();

      if (personError) throw personError;

      // Step 3: Create donor record
      const { data: donorData, error: donorError } = await supabase
        .from('donors')
        .insert({
          person_id: personData.id,
          donor_number: data.donorNumber,
          sperm_bank: data.cryobankName,
          donor_type: data.donorType,
          is_anonymous: data.isAnonymous,
          metadata: {
            consent_to_contact: data.consentToContact,
            signup_date: new Date().toISOString(),
            privacy_settings: {
              privacy_level: data.isAnonymous ? 'anonymous' : 'semi-open',
              allow_family_messages: true,
              allow_clinic_messages: true,
              require_message_approval: true,
              message_notifications: true,
              show_basic_info: true,
              show_physical_characteristics: true,
              show_health_history: true,
              show_education: !data.isAnonymous,
              show_occupation: !data.isAnonymous,
              show_interests: !data.isAnonymous,
              show_personal_statement: !data.isAnonymous,
              show_contact_info: false,
              show_photos: false,
              clinic_can_view_profile: true,
              clinic_can_contact_directly: false,
              allow_data_sharing: false,
              allow_research: false
            }
          }
        })
        .select()
        .single();

      if (donorError) throw donorError;

      return {
        user: authData.user,
        person: personData,
        donor: donorData,
        error: null
      };
    } catch (error) {
      console.error('Error creating donor account:', error);
      return {
        user: null,
        person: null,
        donor: null,
        error
      };
    }
  },

  /**
   * Check if a user is a donor
   */
  async isDonor(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('persons')
        .select('person_type')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data?.person_type === 'donor';
    } catch (error) {
      console.error('Error checking donor status:', error);
      return false;
    }
  },

  /**
   * Get donor profile
   */
  async getDonorProfile(userId: string) {
    try {
      const { data: personData, error: personError } = await supabase
        .from('persons')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (personError) throw personError;

      const { data: donorData, error: donorError } = await supabase
        .from('donors')
        .select(`
          *,
          person:person_id (
            id,
            first_name,
            last_name,
            date_of_birth,
            email,
            phone,
            user_id
          )
        `)
        .eq('person_id', personData.id)
        .single();

      if (donorError) throw donorError;

      return {
        data: donorData,
        error: null
      };
    } catch (error) {
      console.error('Error fetching donor profile:', error);
      return {
        data: null,
        error
      };
    }
  },

  /**
   * Update donor privacy settings
   */
  async updatePrivacySettings(userId: string, settings: any) {
    try {
      const { data: personData } = await supabase
        .from('persons')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!personData) throw new Error('Person not found');

      const { data, error } = await supabase
        .from('donors')
        .update({
          is_anonymous: settings.privacyLevel === 'anonymous',
          metadata: {
            privacy_settings: settings
          },
          updated_at: new Date().toISOString()
        })
        .eq('person_id', personData.id)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null
      };
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      return {
        data: null,
        error
      };
    }
  }
};