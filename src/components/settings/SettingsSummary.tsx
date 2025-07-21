import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Bell, Mail, Database, Eye, EyeOff } from "lucide-react";
import { UserSettings } from "@/hooks/use-user-settings";

interface SettingsSummaryProps {
  settings: UserSettings;
}

export function SettingsSummary({ settings }: SettingsSummaryProps) {
  const summaryItems = [
    {
      icon: Shield,
      label: "Privacy Mode",
      value: settings.privacy_mode,
      description: settings.privacy_mode ? "Profile hidden from searches" : "Profile visible in searches",
    },
    {
      icon: Database,
      label: "Data Sharing",
      value: settings.data_sharing,
      description: settings.data_sharing ? "Helping improve the platform" : "No data sharing",
    },
    {
      icon: Bell,
      label: "Email Notifications",
      value: settings.email_notifications,
      description: settings.email_notifications ? "Receiving important updates" : "No email notifications",
    },
    {
      icon: Mail,
      label: "Marketing Emails",
      value: settings.marketing_emails,
      description: settings.marketing_emails ? "Receiving promotional content" : "No marketing emails",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Settings Overview
        </CardTitle>
        <CardDescription>
          Quick view of your current preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                </div>
                <Badge
                  variant={item.value ? "default" : "secondary"}
                  className="ml-2"
                >
                  {item.value ? "On" : "Off"}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}