import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingUp, 
  Download, 
  Calendar,
  Music,
  Play,
  Users,
  Globe,
  BarChart3,
  FileText
} from "lucide-react";

export const RoyaltyDashboard = () => {
  const monthlyEarnings = [
    { month: "Jan", amount: 234, streams: 12500 },
    { month: "Feb", amount: 456, streams: 18900 },
    { month: "Mar", amount: 567, streams: 23400 },
    { month: "Apr", amount: 789, streams: 28700 },
    { month: "May", amount: 923, streams: 34200 },
    { month: "Jun", amount: 1234, streams: 42100 },
  ];

  const topTracks = [
    { 
      title: "Summer Nights", 
      earnings: 456.78, 
      streams: 23400, 
      platforms: ["Spotify", "Apple Music", "YouTube Music"] 
    },
    { 
      title: "Midnight Dreams", 
      earnings: 324.56, 
      streams: 18900, 
      platforms: ["Spotify", "Apple Music"] 
    },
    { 
      title: "City Lights", 
      earnings: 234.12, 
      streams: 15600, 
      platforms: ["Spotify", "YouTube Music", "Amazon Music"] 
    }
  ];

  const platforms = [
    { name: "Spotify", earnings: 678.45, percentage: 42, color: "bg-green-500" },
    { name: "Apple Music", earnings: 345.23, percentage: 28, color: "bg-gray-600" },
    { name: "YouTube Music", earnings: 156.78, percentage: 18, color: "bg-red-500" },
    { name: "Amazon Music", earnings: 89.12, percentage: 8, color: "bg-blue-500" },
    { name: "Others", earnings: 45.67, percentage: 4, color: "bg-purple-500" }
  ];

  const totalEarnings = platforms.reduce((sum, platform) => sum + platform.earnings, 0);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Royalty Dashboard</h2>
          <p className="text-muted-foreground mt-2">
            Track your music earnings and streaming performance
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="hero">
            <FileText className="mr-2 h-4 w-4" />
            Tax Documents
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-primary/10 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-8 w-8 text-primary" />
              <Badge variant="secondary" className="text-xs">
                +12.5%
              </Badge>
            </div>
            <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">Total Earnings This Month</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Play className="h-8 w-8 text-primary" />
              <Badge variant="secondary" className="text-xs">
                +18%
              </Badge>
            </div>
            <div className="text-2xl font-bold">127.3K</div>
            <p className="text-sm text-muted-foreground">Total Streams</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Globe className="h-8 w-8 text-primary" />
              <Badge variant="secondary" className="text-xs">
                +5%
              </Badge>
            </div>
            <div className="text-2xl font-bold">47</div>
            <p className="text-sm text-muted-foreground">Countries</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-primary" />
              <Badge variant="secondary" className="text-xs">
                +23%
              </Badge>
            </div>
            <div className="text-2xl font-bold">8.9K</div>
            <p className="text-sm text-muted-foreground">Monthly Listeners</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Platform Breakdown */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Platform Breakdown
            </CardTitle>
            <CardDescription>
              Earnings distribution across streaming platforms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {platforms.map((platform, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${platform.color}`}></div>
                    <span className="font-medium text-sm">{platform.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${platform.earnings.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">{platform.percentage}%</div>
                  </div>
                </div>
                <Progress value={platform.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Performing Tracks */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5 text-primary" />
              Top Performing Tracks
            </CardTitle>
            <CardDescription>
              Your highest earning songs this month
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topTracks.map((track, index) => (
              <div key={index} className="p-4 rounded-lg bg-secondary/20 border border-border/50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{track.title}</h4>
                  <div className="text-right">
                    <div className="font-bold text-primary">${track.earnings.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">{track.streams.toLocaleString()} streams</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {track.platforms.map((platform, platIndex) => (
                    <Badge key={platIndex} variant="outline" className="text-xs">
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Earnings Trend
          </CardTitle>
          <CardDescription>
            Your monthly earnings and streaming growth over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-4">
            {monthlyEarnings.map((month, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="bg-secondary/20 rounded-lg p-4 hover:bg-secondary/30 transition-colors">
                  <div className="text-sm font-medium text-muted-foreground">{month.month}</div>
                  <div className="text-lg font-bold text-primary">${month.amount}</div>
                  <div className="text-xs text-muted-foreground">{month.streams.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Schedule */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Payment Schedule
          </CardTitle>
          <CardDescription>
            Upcoming royalty payments and payment history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Upcoming Payments</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/20 border border-border/50">
                  <div>
                    <div className="font-medium">Spotify</div>
                    <div className="text-sm text-muted-foreground">Payment for June</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">$678.45</div>
                    <div className="text-xs text-muted-foreground">Aug 15</div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/20 border border-border/50">
                  <div>
                    <div className="font-medium">Apple Music</div>
                    <div className="text-sm text-muted-foreground">Payment for June</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">$345.23</div>
                    <div className="text-xs text-muted-foreground">Aug 20</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Recent Payments</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div>
                    <div className="font-medium">Spotify</div>
                    <div className="text-sm text-muted-foreground">Payment for May</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-500">$623.12</div>
                    <div className="text-xs text-muted-foreground">Paid Jul 15</div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div>
                    <div className="font-medium">Apple Music</div>
                    <div className="text-sm text-muted-foreground">Payment for May</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-500">$298.67</div>
                    <div className="text-xs text-muted-foreground">Paid Jul 20</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};