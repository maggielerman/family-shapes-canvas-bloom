import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useUserSettings } from "@/hooks/use-user-settings";
import { useAuth } from "@/components/auth/AuthContext";
import { DeleteAccountDialog } from "@/components/settings/DeleteAccountDialog";
import { DataExportDialog } from "@/components/settings/DataExportDialog";
import { SettingsSummary } from "@/components/settings/SettingsSummary";
import { Shield, Bell, Mail, Database, Save } from "lucide-react";
import { useState, useEffect } from "react";

const Settings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: userSettings, isLoading, updateSettings } = useUserSettings();
  
  const [settings, setSettings] = useState({
    privacy_mode: false,
    data_sharing: true,
    email_notifications: true,
    marketing_emails: false,
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (userSettings) {
      const newSettings = {
        privacy_mode: userSettings.privacy_mode ?? false,
        data_sharing: userSettings.data_sharing ?? true,
        email_notifications: userSettings.email_notifications ?? true,
        marketing_emails: userSettings.marketing_emails ?? false,
      };
      setSettings(newSettings);
    }
  }, [userSettings]);

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(settings);
      setHasChanges(false);
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved successfully.",
      });
    } catch (error) {
      console.error("Settings update error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    if (userSettings) {
      const resetSettings = {
        privacy_mode: userSettings.privacy_mode ?? false,
        data_sharing: userSettings.data_sharing ?? true,
        email_notifications: userSettings.email_notifications ?? true,
        marketing_emails: userSettings.marketing_emails ?? false,
      };
      setSettings(resetSettings);
      setHasChanges(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and privacy settings
          </p>
          {userSettings?.updated_at && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {new Date(userSettings.updated_at).toLocaleDateString()}
            </p>
          )}
        </div>
        {hasChanges && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleSave} disabled={updateSettings.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {updateSettings.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {/* Settings Summary */}
        {userSettings && !hasChanges && (
          <SettingsSummary settings={userSettings} />
        )}

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy Settings
            </CardTitle>
            <CardDescription>
              Control how your data is used and who can see your information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="privacy-mode">Privacy Mode</Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, your profile and family trees will be hidden from public searches
                </p>
              </div>
              <Switch
                id="privacy-mode"
                checked={settings.privacy_mode}
                onCheckedChange={(checked) => handleSettingChange('privacy_mode', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="data-sharing">Data Sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Allow anonymized data to be used for improving the platform and research
                </p>
              </div>
              <Switch
                id="data-sharing"
                checked={settings.data_sharing}
                onCheckedChange={(checked) => handleSettingChange('data_sharing', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose what notifications you'd like to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive important updates about your family trees and account
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.email_notifications}
                onCheckedChange={(checked) => handleSettingChange('email_notifications', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="marketing-emails">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about new features, tips, and special offers
                </p>
              </div>
              <Switch
                id="marketing-emails"
                checked={settings.marketing_emails}
                onCheckedChange={(checked) => handleSettingChange('marketing_emails', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Manage your account data and privacy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DataExportDialog>
                <Button variant="outline" className="justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Download My Data
                </Button>
              </DataExportDialog>
              <DeleteAccountDialog userEmail={user?.email}>
                <Button variant="outline" className="justify-start text-destructive hover:text-destructive">
                  Delete Account
                </Button>
              </DeleteAccountDialog>
            </div>
            <p className="text-sm text-muted-foreground">
              You can request a copy of your data or delete your account permanently. 
              These actions may take some time to process.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;