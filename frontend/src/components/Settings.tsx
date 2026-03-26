import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, type FormEvent } from "react";
import {
  User,
  Bell,
  Shield,
  Palette,
  Plug,
  Settings as SettingsIcon,
  ChevronRight,
  LifeBuoy,
  Loader2,
  MessageSquarePlus,
  Clock3,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { useCreateSupportTicket, useSupportTickets } from "@/hooks/api/useSupportTickets";
import type { SupportTicketCategory, SupportTicketPriority, SupportTicketStatus } from "@/types/api";

export const Settings = () => {
  const [supportTicketForm, setSupportTicketForm] = useState({
    subject: "",
    category: "technical" as SupportTicketCategory,
    priority: "medium" as SupportTicketPriority,
    description: "",
  });

  const { data: supportTickets = [], isLoading: supportTicketsLoading } = useSupportTickets();
  const createSupportTicket = useCreateSupportTicket();

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

  const handleSupportTicketSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await createSupportTicket.mutateAsync(supportTicketForm);
      toast.success("Support ticket submitted", {
        description: "We’ll review your request and follow up as soon as possible.",
      });

      setSupportTicketForm({
        subject: "",
        category: "technical",
        priority: "medium",
        description: "",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit your support ticket right now.");
    }
  };

  const getStatusLabel = (status: SupportTicketStatus): string => {
    switch (status) {
      case "open":
        return "Open";
      case "in_progress":
        return "In progress";
      case "waiting_on_user":
        return "Waiting on you";
      case "resolved":
        return "Resolved";
      case "closed":
        return "Closed";
      default:
        return status;
    }
  };

  const formatSupportDate = (dateValue: string | null): string => {
    if (!dateValue) {
      return "Just now";
    }

    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(dateValue));
  };

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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-primary" />
              Contact Support
            </CardTitle>
            <CardDescription>
              Submit a tracked support ticket for billing, onboarding, or technical help.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSupportTicketSubmit}>
              <div className="space-y-2">
                <Label htmlFor="support-subject">Subject</Label>
                <Input
                  id="support-subject"
                  placeholder="What do you need help with?"
                  value={supportTicketForm.subject}
                  onChange={(event) =>
                    setSupportTicketForm((current) => ({
                      ...current,
                      subject: event.target.value,
                    }))
                  }
                  maxLength={150}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="support-category">Category</Label>
                  <Select
                    value={supportTicketForm.category}
                    onValueChange={(value) =>
                      setSupportTicketForm((current) => ({
                        ...current,
                        category: value as SupportTicketCategory,
                      }))
                    }
                  >
                    <SelectTrigger id="support-category">
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="onboarding">Onboarding</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="feature_request">Feature request</SelectItem>
                      <SelectItem value="account">Account</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-priority">Priority</Label>
                  <Select
                    value={supportTicketForm.priority}
                    onValueChange={(value) =>
                      setSupportTicketForm((current) => ({
                        ...current,
                        priority: value as SupportTicketPriority,
                      }))
                    }
                  >
                    <SelectTrigger id="support-priority">
                      <SelectValue placeholder="Choose a priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="support-description">Description</Label>
                <Textarea
                  id="support-description"
                  placeholder="Include any context, screenshots, or exact steps to help us resolve it faster."
                  value={supportTicketForm.description}
                  onChange={(event) =>
                    setSupportTicketForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className="min-h-[140px]"
                  maxLength={4000}
                  required
                />
              </div>

              <Button type="submit" disabled={createSupportTicket.isPending} className="w-full sm:w-auto">
                {createSupportTicket.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit support ticket
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              <MessageSquarePlus className="h-5 w-5 text-primary" />
              Recent Tickets
            </CardTitle>
            <CardDescription>
              Track the status of your latest support requests in one place.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {supportTicketsLoading ? (
              <div className="space-y-3">
                <div className="h-20 animate-pulse rounded-lg bg-muted" />
                <div className="h-20 animate-pulse rounded-lg bg-muted" />
              </div>
            ) : supportTickets.length > 0 ? (
              <div className="space-y-3">
                {supportTickets.slice(0, 4).map((ticket) => (
                  <div key={ticket.id} className="rounded-lg border p-4 space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium">{ticket.subject}</h4>
                          <Badge variant="outline">{ticket.category.replace('_', ' ')}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Submitted {formatSupportDate(ticket.created_at)}
                        </p>
                      </div>
                      <Badge variant="secondary">{getStatusLabel(ticket.status)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">{ticket.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock3 className="h-3.5 w-3.5" />
                      Priority: {ticket.priority}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                <LifeBuoy className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                No support tickets yet. Submit one on the left if you need help.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
};