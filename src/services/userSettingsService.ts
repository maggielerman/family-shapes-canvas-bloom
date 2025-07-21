import { supabase } from "@/integrations/supabase/client";
import { UserSettings, UserSettingsUpdate } from "@/hooks/use-user-settings";

export class UserSettingsService {
  /**
   * Get user settings by user ID
   */
  static async getUserSettings(userId: string): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * Create default settings for a new user
   */
  static async createDefaultSettings(userId: string): Promise<UserSettings> {
    const defaultSettings = {
      user_id: userId,
      privacy_mode: false,
      data_sharing: true,
      email_notifications: true,
      marketing_emails: false,
    };

    const { data, error } = await supabase
      .from("user_settings")
      .insert(defaultSettings)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update user settings
   */
  static async updateUserSettings(
    userId: string,
    updates: UserSettingsUpdate
  ): Promise<UserSettings> {
    const { data, error } = await supabase
      .from("user_settings")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get or create user settings (ensures settings exist)
   */
  static async getOrCreateUserSettings(userId: string): Promise<UserSettings> {
    let settings = await this.getUserSettings(userId);
    
    if (!settings) {
      settings = await this.createDefaultSettings(userId);
    }
    
    return settings;
  }

  /**
   * Delete user settings (for account deletion)
   */
  static async deleteUserSettings(userId: string): Promise<void> {
    const { error } = await supabase
      .from("user_settings")
      .delete()
      .eq("user_id", userId);

    if (error) throw error;
  }

  /**
   * Bulk update settings for multiple users (admin function)
   */
  static async bulkUpdateSettings(
    updates: Array<{ user_id: string; settings: UserSettingsUpdate }>
  ): Promise<void> {
    const promises = updates.map(({ user_id, settings }) =>
      this.updateUserSettings(user_id, settings)
    );

    await Promise.all(promises);
  }
}