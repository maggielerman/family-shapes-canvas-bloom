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
            account_type: 'donor' // Store in user metadata
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // Step 2: Create/update user_profile with donor account type
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: authData.user.id,
          account_type: 'donor',
          full_name: data.fullName,
          settings: {
            privacy_level: data.isAnonymous ? 'anonymous' : 'semi-open',
            consent_to_contact: data.consentToContact
          }
        })
        .select()
        .single();

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        // Don't throw, continue with other steps
      }

      // Step 3: Create person record
      const { data: personData, error: personError } = await supabase
        .from('persons')
        .insert({
          user_id: authData.user.id,
          name: data.fullName,
          email: data.email,
          donor: true // Mark as donor in persons table
        })
        .select()
        .single();

      if (personError) throw personError;

      // Step 4: Create donor record in existing donors table
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

      // Step 5: Try to create donor_profiles record if table exists
      try {
        const { data: donorProfile } = await supabase
          .from('donor_profiles')
          .insert({
            user_id: authData.user.id,
            person_id: personData.id,
            donor_number: data.donorNumber,
            cryobank_name: data.cryobankName,
            donor_type: data.donorType,
            is_anonymous: data.isAnonymous,
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
              show_photos: false
            }
          })
          .select()
          .single();
      } catch (e) {
        // Table might not exist yet, that's okay
        console.log('donor_profiles table may not exist yet');
      }

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
      // First check user_profiles table
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('account_type')
        .eq('id', userId)
        .single();

      if (profileData?.account_type === 'donor') {
        return true;
      }

      // Fallback: check persons table
      const { data: personData } = await supabase
        .from('persons')
        .select('donor')
        .eq('user_id', userId)
        .single();

      return personData?.donor === true;
    } catch (error) {
      console.error('Error checking if user is donor:', error);
      return false;
    }
  },

  /**
   * Get donor profile data
   */
  async getDonorProfile(userId: string) {
    try {
      // Get user profile
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Get person data
      const { data: person } = await supabase
        .from('persons')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!person) {
        throw new Error('Person record not found');
      }

      // Get donor data
      const { data: donor } = await supabase
        .from('donors')
        .select('*')
        .eq('person_id', person.id)
        .single();

      return {
        userProfile,
        person,
        donor,
        error: null
      };
    } catch (error) {
      console.error('Error getting donor profile:', error);
      return {
        userProfile: null,
        person: null,
        donor: null,
        error
      };
    }
  },

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(donorId: string, privacySettings: any) {
    try {
      const { data, error } = await supabase
        .from('donors')
        .update({
          metadata: supabase.sql`
            jsonb_set(
              COALESCE(metadata, '{}'::jsonb),
              '{privacy_settings}',
              ${JSON.stringify(privacySettings)}::jsonb
            )
          `
        })
        .eq('id', donorId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      return { data: null, error };
    }
  }
};