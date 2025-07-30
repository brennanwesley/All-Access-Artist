import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Plug,
  Settings as SettingsIcon,
  ChevronRight
} from "lucide-react";

export const Settings = () => {
  const settingsCategories = [
    {
      id: "account",
      name: "Account",
      description: "Manage your profile, subscription, and personal information",
      icon: User,
      color: "bg-slate-600",
      items: [
        { name: "Profile Information", description: "Update your artist name, bio, and contact details" },
        { name: "Subscription Plan", description: "View and manage your current subscription" },
        { name: "Billing Information", description: "Update payment methods and billing address" },
        { name: "Account Security", description: "Change password and manage account access" }
      ]
    },
    {
      id: "notifications",
      name: "Notifications",
      description: "Configure email, push, and in-app notification preferences",
      icon: Bell,
      color: "bg-amber-600",
      items: [
        { name: "Email Notifications", description: "Control which emails you receive" },
        { name: "Push Notifications", description: "Manage mobile and desktop notifications" },
        { name: "Release Alerts", description: "Get notified about release milestones" },
        { name: "Analytics Updates", description: "Receive weekly performance summaries" }
      ]
    },
    {
      id: "privacy-security",
      name: "Privacy & Security",
      description: "Control data sharing, two-factor authentication, and privacy settings",
      icon: Shield,
      color: "bg-emerald-600",
      items: [
        { name: "Data Privacy", description: "Control how your data is used and shared" },
        { name: "Two-Factor Authentication", description: "Add an extra layer of security" },
        { name: "Login Activity", description: "View recent account access history" },
        { name: "Connected Apps", description: "Manage third-party app permissions" }
      ]
    },
    {
      id: "preferences",
      name: "Preferences",
      description: "Customize your dashboard layout, themes, and user experience",
      icon: Palette,
      color: "bg-violet-600",
      items: [
        { name: "Dashboard Layout", description: "Customize your dashboard organization" },
        { name: "Theme Settings", description: "Choose between light, dark, or auto themes" },
        { name: "Language & Region", description: "Set your preferred language and timezone" },
        { name: "Default Views", description: "Set default pages and data displays" }
      ]
    },
    {
      id: "integrations",
      name: "Integrations",
      description: "Manage API connections and third-party app permissions",
      icon: Plug,
      color: "bg-cyan-600",
      items: [
        { name: "Connected Platforms", description: "Manage your social media and streaming connections" },
        { name: "API Access", description: "Generate and manage API keys" },
        { name: "Webhooks", description: "Configure automated data sharing" },
        { name: "Data Sync", description: "Control how often data is synchronized" }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground">
          Configure your account preferences, notification settings, privacy controls, and customize your experience
        </p>
      </div>

      {/* Settings Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settingsCategories.map((category) => {
          const Icon = category.icon;
          
          return (
            <Card key={category.id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{category.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {category.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {category.items.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 cursor-pointer group transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4">
                  Manage {category.name}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Settings</CardTitle>
          <CardDescription>
            Frequently used settings for quick access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Dark Mode</h4>
              <p className="text-sm text-muted-foreground">Toggle between light and dark themes</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Email Notifications</h4>
              <p className="text-sm text-muted-foreground">Receive updates via email</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto-sync Data</h4>
              <p className="text-sm text-muted-foreground">Automatically sync platform data</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Show Dashboard Tips</h4>
              <p className="text-sm text-muted-foreground">Display helpful tips and guidance</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};