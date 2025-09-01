import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Music, TrendingUp, Users, Zap, Star, BarChart3 } from 'lucide-react'

const LandingPage = () => {

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-blue-900/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
              All Access Artist
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              The complete platform for independent artists to manage releases, 
              grow their audience, and maximize their music career potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/plans">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3">
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-border/50 text-foreground hover:bg-card/50 px-8 py-3">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From release management to fan engagement, we've got all the tools 
              to take your music career to the next level.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Music className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Release Management</CardTitle>
                <CardDescription>
                  Plan, organize, and execute your music releases with our comprehensive project management tools.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                </div>
                <CardTitle>Analytics & Insights</CardTitle>
                <CardDescription>
                  Track your performance across all platforms with detailed analytics and actionable insights.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
                <CardTitle>Fan Engagement</CardTitle>
                <CardDescription>
                  Build and nurture your fanbase with powerful engagement tools and community features.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-yellow-400" />
                </div>
                <CardTitle>Content Creation</CardTitle>
                <CardDescription>
                  Generate professional content for social media, press releases, and promotional materials.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-red-400" />
                </div>
                <CardTitle>Label Copy Generation</CardTitle>
                <CardDescription>
                  Automatically generate professional label copy and metadata for your releases.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-indigo-400" />
                </div>
                <CardTitle>Revenue Tracking</CardTitle>
                <CardDescription>
                  Monitor your earnings and royalties across all streaming platforms and revenue sources.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <Card className="max-w-4xl mx-auto bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="text-center p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Take Your Music Career to the Next Level?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of independent artists who are already using All Access Artist 
              to grow their careers and connect with fans worldwide.
            </p>
            <Link to="/plans">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3">
                Start Your Journey Today
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LandingPage
