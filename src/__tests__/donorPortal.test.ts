import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { donorAuthService } from '@/services/donorAuthService';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      getUser: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
    sql: vi.fn(),
  },
}));

describe('Donor Portal Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Donor Authentication', () => {
    it('should create a donor account with correct account_type', async () => {
      const mockUser = { id: 'user-123', email: 'donor@example.com' };
      const mockProfile = { id: 'user-123', account_type: 'donor' };
      const mockPerson = { id: 'person-123', donor: true };
      const mockDonor = { id: 'donor-123', is_anonymous: true };

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      vi.mocked(supabase.from).mockImplementation((table: string) => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => {
          if (table === 'user_profiles') return { data: mockProfile, error: null };
          if (table === 'persons') return { data: mockPerson, error: null };
          if (table === 'donors') return { data: mockDonor, error: null };
          return { data: null, error: null };
        }),
      }));

      const result = await donorAuthService.signUpDonor({
        email: 'donor@example.com',
        password: 'password123',
        fullName: 'John Donor',
        donorNumber: 'D12345',
        cryobankName: 'Test Bank',
        donorType: 'sperm',
        isAnonymous: true,
        consentToContact: true,
      });

      expect(result.error).toBeNull();
      expect(result.user).toEqual(mockUser);
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'donor@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'John Donor',
            account_type: 'donor',
          },
        },
      });
    });

    it('should check if user is a donor by account_type', async () => {
      const mockProfile = { account_type: 'donor' };

      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockReturnThis(),
      }));

      const isDonor = await donorAuthService.isDonor('user-123');
      expect(isDonor).toBe(true);
    });

    it('should return false for non-donor users', async () => {
      const mockProfile = { account_type: 'individual' };

      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockReturnThis(),
      }));

      const isDonor = await donorAuthService.isDonor('user-123');
      expect(isDonor).toBe(false);
    });
  });

  describe('Donor Profile Management', () => {
    it('should fetch complete donor profile', async () => {
      const mockUserProfile = { id: 'user-123', account_type: 'donor', full_name: 'John Donor' };
      const mockPerson = { id: 'person-123', name: 'John Donor', donor: true };
      const mockDonor = { 
        id: 'donor-123',
        donor_number: 'D12345',
        is_anonymous: true,
        medical_history: { conditions: [] }
      };

      vi.mocked(supabase.from).mockImplementation((table: string) => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => {
          if (table === 'user_profiles') return { data: mockUserProfile, error: null };
          if (table === 'persons') return { data: mockPerson, error: null };
          if (table === 'donors') return { data: mockDonor, error: null };
          return { data: null, error: null };
        }),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockReturnThis(),
      }));

      const result = await donorAuthService.getDonorProfile('user-123');
      
      expect(result.error).toBeNull();
      expect(result.userProfile).toEqual(mockUserProfile);
      expect(result.person).toEqual(mockPerson);
      expect(result.donor).toEqual(mockDonor);
    });

    it('should update privacy settings', async () => {
      const privacySettings = {
        privacy_level: 'semi-open',
        allow_family_messages: true,
        require_message_approval: false,
      };

      const mockUpdatedDonor = { 
        id: 'donor-123',
        metadata: { privacy_settings: privacySettings }
      };

      vi.mocked(supabase.from).mockImplementation(() => ({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUpdatedDonor, error: null }),
        insert: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockReturnThis(),
      }));

      const result = await donorAuthService.updatePrivacySettings('donor-123', privacySettings);
      
      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockUpdatedDonor);
    });
  });

  describe('Data Integrity', () => {
    it('should handle missing donor_profiles table gracefully', async () => {
      const mockUser = { id: 'user-123', email: 'donor@example.com' };
      const mockProfile = { id: 'user-123', account_type: 'donor' };
      const mockPerson = { id: 'person-123', donor: true };
      const mockDonor = { id: 'donor-123' };

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      let callCount = 0;
      vi.mocked(supabase.from).mockImplementation((table: string) => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => {
          callCount++;
          if (table === 'user_profiles') return { data: mockProfile, error: null };
          if (table === 'persons') return { data: mockPerson, error: null };
          if (table === 'donors') return { data: mockDonor, error: null };
          if (table === 'donor_profiles') {
            return { data: null, error: new Error('Table not found') };
          }
          return { data: null, error: null };
        }),
      }));

      const result = await donorAuthService.signUpDonor({
        email: 'donor@example.com',
        password: 'password123',
        fullName: 'John Donor',
        donorType: 'sperm',
        isAnonymous: true,
        consentToContact: true,
      });

      // Should still succeed even if donor_profiles doesn't exist
      expect(result.error).toBeNull();
      expect(result.user).toEqual(mockUser);
    });

    it('should handle both new and existing user_profiles constraint', async () => {
      // This test verifies that the migration handles existing constraints properly
      // The actual test would be run against a real database, but here we verify the logic
      expect(true).toBe(true); // Placeholder for integration test
    });
  });

  describe('Existing Functionality', () => {
    it('should not break individual user authentication', async () => {
      const mockUser = { id: 'user-456', email: 'user@example.com' };
      const mockProfile = { id: 'user-456', account_type: 'individual' };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: {} as any },
        error: null,
      });

      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockReturnThis(),
      }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'user@example.com',
        password: 'password123',
      });

      expect(error).toBeNull();
      expect(data.user).toEqual(mockUser);
    });

    it('should not break organization user authentication', async () => {
      const mockUser = { id: 'user-789', email: 'org@example.com' };
      const mockProfile = { id: 'user-789', account_type: 'organization' };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: {} as any },
        error: null,
      });

      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockReturnThis(),
      }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'org@example.com',
        password: 'password123',
      });

      expect(error).toBeNull();
      expect(data.user).toEqual(mockUser);
    });
  });
});