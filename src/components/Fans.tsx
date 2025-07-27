import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, Mail, Users, Download, Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const Fans = () => {
  const [fanData, setFanData] = useState(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Mock fan data for demo
      setFanData([
        { name: "Sarah Johnson", email: "sarah@email.com", location: "Nashville, TN", source: "feature.fm" },
        { name: "Mike Chen", email: "mike@email.com", location: "Los Angeles, CA", source: "feature.fm" },
        { name: "Emma Davis", email: "emma@email.com", location: "New York, NY", source: "feature.fm" },
      ]);
      toast({
        title: "Fan data uploaded",
        description: `Imported ${3} fans from ${file.name}`,
      });
    }
  };

  const handleSendEmail = () => {
    if (!emailSubject || !emailContent) {
      toast({
        title: "Error",
        description: "Please fill in both subject and content fields",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Email sent!",
      description: `Mass email sent to ${fanData?.length || 0} fans`,
    });
  };

  const emailTemplates = [
    {
      name: "New Release Announcement",
      subject: "🎵 My new song is here!",
      content: "Hey there!\n\nI'm so excited to share my latest release with you. This song means the world to me and I can't wait for you to hear it.\n\nStream it now: [LINK]\n\nThanks for being an amazing fan!\n\nWith love,\n[YOUR NAME]"
    },
    {
      name: "Show Announcement",
      subject: "🎤 Come see me live!",
      content: "Amazing news!\n\nI'm performing live and I'd love to see you there. Here are the details:\n\nDate: [DATE]\nVenue: [VENUE]\nTime: [TIME]\n\nGet your tickets: [LINK]\n\nCan't wait to see you!\n\n[YOUR NAME]"
    },
    {
      name: "Thank You Message",
      subject: "💙 Thank you for your support",
      content: "I just wanted to take a moment to thank you for supporting my music.\n\nYour support means everything to me and helps me continue creating music that I love.\n\nStay tuned for more exciting things coming soon!\n\nWith gratitude,\n[YOUR NAME]"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Fan Management</h1>
        <p className="text-muted-foreground">Manage your fan data and communicate with your audience</p>
      </div>

      {/* Fan Data Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Fan Data Import
          </CardTitle>
          <CardDescription>
            Upload your fan spreadsheet exported from feature.fm or other platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fan-upload">Upload Fan Data (CSV/Excel)</Label>
            <Input
              id="fan-upload"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="cursor-pointer"
            />
          </div>
          
          {fanData && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4" />
                <span className="font-semibold">{fanData.length} Fans Imported</span>
              </div>
              <div className="space-y-2">
                {fanData.slice(0, 3).map((fan, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="font-medium">{fan.name}</p>
                      <p className="text-sm text-muted-foreground">{fan.email}</p>
                    </div>
                    <Badge variant="outline">{fan.location}</Badge>
                  </div>
                ))}
                {fanData.length > 3 && (
                  <p className="text-sm text-muted-foreground text-center">
                    ... and {fanData.length - 3} more fans
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Campaign
          </CardTitle>
          <CardDescription>
            Send mass emails to your entire fan list
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {emailTemplates.map((template, index) => (
              <Card key={index} className="cursor-pointer hover:bg-secondary/50" onClick={() => {
                setEmailSubject(template.subject);
                setEmailContent(template.content);
              }}>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">{template.subject}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-subject">Email Subject</Label>
              <Input
                id="email-subject"
                placeholder="Enter email subject..."
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email-content">Email Content</Label>
              <Textarea
                id="email-content"
                placeholder="Write your email content..."
                className="min-h-[200px]"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleSendEmail} disabled={!fanData} className="flex-1">
                <Send className="mr-2 h-4 w-4" />
                Send to {fanData?.length || 0} Fans
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Preview
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};