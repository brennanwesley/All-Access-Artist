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
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { useState } from "react";

export const RoyaltyDashboard = () => {
  const [tooltipContent, setTooltipContent] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Country data with listening statistics
  const countryData = {
    "United States": { listeners: 45620, streams: 2340000, socialViews: 890000, earnings: 2340.50 },
    "United Kingdom": { listeners: 23450, streams: 1200000, socialViews: 450000, earnings: 1200.30 },
    "Canada": { listeners: 12340, streams: 634000, socialViews: 234000, earnings: 634.20 },
    "Germany": { listeners: 18900, streams: 945000, socialViews: 380000, earnings: 945.80 },
    "France": { listeners: 15600, streams: 780000, socialViews: 320000, earnings: 780.40 },
    "Australia": { listeners: 8900, streams: 445000, socialViews: 189000, earnings: 445.60 },
    "Japan": { listeners: 21000, streams: 1050000, socialViews: 520000, earnings: 1050.75 },
    "Brazil": { listeners: 34500, streams: 1725000, socialViews: 680000, earnings: 1725.90 },
    "Mexico": { listeners: 19800, streams: 990000, socialViews: 420000, earnings: 990.35 },
    "Sweden": { listeners: 5600, streams: 280000, socialViews: 125000, earnings: 280.15 },
    "Norway": { listeners: 3400, streams: 170000, socialViews: 89000, earnings: 170.25 },
    "Netherlands": { listeners: 8200, streams: 410000, socialViews: 180000, earnings: 410.80 },
    "Spain": { listeners: 14300, streams: 715000, socialViews: 295000, earnings: 715.45 },
    "Italy": { listeners: 11700, streams: 585000, socialViews: 240000, earnings: 585.90 },
    "South Korea": { listeners: 16800, streams: 840000, socialViews: 420000, earnings: 840.60 }
  };

  // Top performing countries for markers
  const topCountries = [
    { name: "United States", coordinates: [-95.7, 37.1], ...countryData["United States"] },
    { name: "Brazil", coordinates: [-47.9, -15.8], ...countryData["Brazil"] },
    { name: "United Kingdom", coordinates: [-2.0, 54.0], ...countryData["United Kingdom"] },
    { name: "Germany", coordinates: [10.0, 51.0], ...countryData["Germany"] },
    { name: "Japan", coordinates: [139.0, 36.0], ...countryData["Japan"] }
  ];
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
          <h2 className="text-3xl font-bold">Royalties & Analytics</h2>
          <p className="text-muted-foreground mt-2">
            Track your music earnings, streaming performance, and global audience insights
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

      {/* Global Analytics Map */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Global Analytics
          </CardTitle>
          <CardDescription>
            Interactive world map showing your audience distribution and engagement
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="relative w-full h-96 bg-secondary/20 rounded-lg border border-border/50 overflow-hidden">
            {/* Simple SVG World Map */}
            <svg viewBox="0 0 1000 500" className="w-full h-full">
              {/* Simplified world map paths */}
              <g fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.5">
                {/* North America */}
                <path d="M150 150 L200 120 L280 130 L320 160 L300 200 L250 220 L180 200 Z" fill="hsl(var(--primary))" />
                {/* South America */}
                <path d="M220 280 L250 250 L280 270 L290 350 L270 400 L240 380 L210 350 Z" fill="hsl(var(--primary))" />
                {/* Europe */}
                <path d="M450 120 L480 110 L520 120 L540 140 L520 160 L480 150 L450 140 Z" fill="hsl(var(--primary))" />
                {/* Africa */}
                <path d="M460 200 L500 190 L530 220 L540 280 L520 350 L480 360 L450 340 L440 280 L450 220 Z" fill="hsl(var(--muted))" />
                {/* Asia */}
                <path d="M550 100 L650 90 L750 110 L780 140 L770 180 L720 200 L650 190 L580 170 L550 140 Z" fill="hsl(var(--primary))" />
                {/* Australia */}
                <path d="M720 320 L780 310 L800 340 L790 360 L750 370 L720 350 Z" fill="hsl(var(--primary))" />
              </g>
              
              {/* Data visualization circles for top countries */}
              {topCountries.map(({ name, coordinates, listeners }, index) => {
                const x = (coordinates[0] + 180) * (1000 / 360);
                const y = (90 - coordinates[1]) * (500 / 180);
                const radius = Math.max(3, Math.min(15, Math.sqrt(listeners / 1000)));
                
                return (
                  <circle
                    key={name}
                    cx={x}
                    cy={y}
                    r={radius}
                    fill="hsl(var(--primary))"
                    fillOpacity={0.8}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                    className="cursor-pointer hover:fillOpacity-100 transition-opacity"
                    onMouseEnter={(e) => {
                      const data = countryData[name];
                      if (data) {
                        setTooltipContent(`${name}
${data.listeners.toLocaleString()} listeners
${data.streams.toLocaleString()} streams
${data.socialViews.toLocaleString()} social views
$${data.earnings.toFixed(2)} earnings`);
                        setTooltipPosition({ x: e.clientX, y: e.clientY });
                        setShowTooltip(true);
                      }
                    }}
                    onMouseLeave={() => setShowTooltip(false)}
                  />
                );
              })}
            </svg>
            
            {/* Tooltip */}
            {showTooltip && (
              <div
                className="absolute z-50 bg-popover border border-border rounded-lg p-3 text-sm shadow-lg pointer-events-none"
                style={{
                  left: tooltipPosition.x - 100,
                  top: tooltipPosition.y - 120,
                  transform: 'translate(-50%, 0)'
                }}
              >
                <div className="whitespace-pre-line text-popover-foreground">
                  {tooltipContent}
                </div>
              </div>
            )}
          </div>
          
          {/* Stats Grid */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-secondary/20 rounded-lg p-4 border border-border/50">
              <h4 className="font-medium text-sm mb-2">Top Markets</h4>
              <div className="space-y-2">
                {topCountries.slice(0, 3).map((country, index) => (
                  <div key={country.name} className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      {country.name}
                    </span>
                    <span className="text-muted-foreground">{country.listeners.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-secondary/20 rounded-lg p-4 border border-border/50">
              <h4 className="font-medium text-sm mb-2">Total Reach</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Active Countries</span>
                  <span className="text-primary font-medium">47</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Listeners</span>
                  <span className="text-primary font-medium">284K</span>
                </div>
                <div className="flex justify-between">
                  <span>Global Streams</span>
                  <span className="text-primary font-medium">8.2M</span>
                </div>
              </div>
            </div>
            
            <div className="bg-secondary/20 rounded-lg p-4 border border-border/50">
              <h4 className="font-medium text-sm mb-2">Growth Trends</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>New Markets</span>
                  <span className="text-green-500 font-medium">+3 this month</span>
                </div>
                <div className="flex justify-between">
                  <span>Fastest Growing</span>
                  <span className="text-primary font-medium">Brazil</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg. Growth</span>
                  <span className="text-green-500 font-medium">+18.5%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(var(--primary))" }}></div>
              <span>Countries with listeners</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-muted"></div>
              <span>No data available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--primary))" }}></div>
              <span>Top markets (circle size = listeners)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};