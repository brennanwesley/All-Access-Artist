import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Music, TrendingUp, Users, Zap, Star, BarChart3 } from 'lucide-react'

const LandingPage = () => {

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-purple-subtle)' }}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'var(--gradient-purple-hero)' }} />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="text-center">
            <div 
              className="mb-8 inline-block rounded-2xl border border-white/10 p-6 backdrop-blur-xl sm:p-8"
              style={{ 
                background: 'var(--glass-purple-header)',
                boxShadow: 'var(--shadow-purple-floating)'
              }}
            >
              <h1 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl md:text-6xl">
                All Access Artist
              </h1>
              <p className="mx-auto mb-8 max-w-3xl text-base text-muted-foreground sm:text-lg md:text-2xl">
                The complete platform for independent artists to manage releases, 
                grow their audience, and maximize their music career potential.
              </p>
            </div>
            <div className="flex flex-col gap-4 justify-center sm:flex-row">
              <Link to="/plans">
                <Button 
                  size="lg" 
                  className="w-full bg-primary px-8 py-3 text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl sm:w-auto md:hover:scale-105"
                  style={{ boxShadow: 'var(--shadow-purple-glow)' }}
                >
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full border-white/20 px-8 py-3 text-foreground backdrop-blur-sm transition-all duration-300 hover:bg-white/10 sm:w-auto sm:hover:scale-105"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 sm:py-20 lg:py-24">
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

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            <Card 
              className="backdrop-blur-xl border border-white/10 transition-all duration-300 sm:hover:scale-105 hover:border-white/20"
              style={{ 
                background: 'var(--glass-purple-card)',
                boxShadow: 'var(--shadow-purple-glow)'
              }}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-primary/30 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm">
                  <Music className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Release Management</CardTitle>
                <CardDescription>
                  Plan, organize, and execute your music releases with our comprehensive project management tools.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="backdrop-blur-xl border border-white/10 transition-all duration-300 sm:hover:scale-105 hover:border-white/20"
              style={{ 
                background: 'var(--glass-purple-card)',
                boxShadow: 'var(--shadow-purple-glow)'
              }}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500/30 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm">
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                </div>
                <CardTitle>Analytics & Insights</CardTitle>
                <CardDescription>
                  Track your performance across all platforms with detailed analytics and actionable insights.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="backdrop-blur-xl border border-white/10 transition-all duration-300 sm:hover:scale-105 hover:border-white/20"
              style={{ 
                background: 'var(--glass-purple-card)',
                boxShadow: 'var(--shadow-purple-glow)'
              }}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-green-500/30 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
                <CardTitle>Fan Engagement</CardTitle>
                <CardDescription>
                  Build and nurture your fanbase with powerful engagement tools and community features.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="backdrop-blur-xl border border-white/10 transition-all duration-300 sm:hover:scale-105 hover:border-white/20"
              style={{ 
                background: 'var(--glass-purple-card)',
                boxShadow: 'var(--shadow-purple-glow)'
              }}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-500/30 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm">
                  <Zap className="h-6 w-6 text-yellow-400" />
                </div>
                <CardTitle>Content Creation</CardTitle>
                <CardDescription>
                  Generate professional content for social media, press releases, and promotional materials.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="backdrop-blur-xl border border-white/10 transition-all duration-300 sm:hover:scale-105 hover:border-white/20"
              style={{ 
                background: 'var(--glass-purple-card)',
                boxShadow: 'var(--shadow-purple-glow)'
              }}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-red-500/30 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm">
                  <Star className="h-6 w-6 text-red-400" />
                </div>
                <CardTitle>Label Copy Generation</CardTitle>
                <CardDescription>
                  Automatically generate professional label copy and metadata for your releases.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="backdrop-blur-xl border border-white/10 transition-all duration-300 sm:hover:scale-105 hover:border-white/20"
              style={{ 
                background: 'var(--glass-purple-card)',
                boxShadow: 'var(--shadow-purple-glow)'
              }}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-500/30 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm">
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
      <div className="py-16 sm:py-20 lg:py-24">
        <Card 
          className="max-w-4xl mx-auto backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300"
          style={{ 
            background: 'var(--glass-purple-cta)',
            boxShadow: 'var(--shadow-purple-deep)'
          }}
        >
          <CardContent className="text-center p-8 sm:p-10 md:p-12">
            <h2 className="mb-6 text-3xl font-bold text-foreground md:text-4xl">
              Ready to Take Your Music Career to the Next Level?
            </h2>
            <p className="mb-8 text-base text-muted-foreground sm:text-lg md:text-xl">
              Join thousands of independent artists who are already using All Access Artist 
              to grow their careers and connect with fans worldwide.
            </p>
            <Link to="/plans">
              <Button 
                size="lg" 
                className="w-full bg-primary px-8 py-3 text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl sm:w-auto sm:hover:scale-105"
                style={{ boxShadow: 'var(--shadow-purple-glow)' }}
              >
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
