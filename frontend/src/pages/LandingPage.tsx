import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Music, Users, BarChart3, FileText, Zap, Shield } from 'lucide-react'

const LandingPage: React.FC = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <Music className="h-8 w-8 text-blue-600" />,
      title: "Release Management",
      description: "Manage your music releases, track metadata, and organize your catalog"
    },
    {
      icon: <FileText className="h-8 w-8 text-green-600" />,
      title: "Label Copy & Lyrics",
      description: "Generate professional label copy and manage song lyrics efficiently"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-purple-600" />,
      title: "Analytics & Insights",
      description: "Track performance metrics and gain insights into your music career"
    },
    {
      icon: <Users className="h-8 w-8 text-orange-600" />,
      title: "Split Sheet Management",
      description: "Manage collaborator credits and royalty splits seamlessly"
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "Content Calendar",
      description: "Plan and schedule your content releases and promotional activities"
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: "Secure & Professional",
      description: "Enterprise-grade security with professional tools for serious artists"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Music className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">All Access Artist</h1>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/login')}
              className="text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Manage Your Music Career
            <span className="text-blue-600 block mt-2">Like a Pro</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The complete platform for independent artists and music professionals. 
            Manage releases, track analytics, generate label copy, and grow your career.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/plans')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Get Started Today
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            Start managing your music career in minutes
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h3>
            <p className="text-lg text-gray-600">
              Professional tools designed specifically for independent artists
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="mb-3">{feature.icon}</div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Take Control of Your Music Career?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of artists who trust All Access Artist to manage their music business
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/plans')}
              className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Start Your Journey
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/login')}
              className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200"
            >
              Already Have an Account?
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <Music className="h-6 w-6 text-blue-400 mr-2" />
            <span className="text-white font-semibold">All Access Artist</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2025 All Access Artist. Professional music management platform.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
