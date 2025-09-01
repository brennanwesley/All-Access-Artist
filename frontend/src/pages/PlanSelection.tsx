import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Music, Check, ArrowLeft, Loader2 } from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

const PlanSelection: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSelectPlan = async (planType: 'artist' | 'manager') => {
    if (planType === 'manager') {
      toast('Manager Plan coming soon!', { icon: '🚀' })
      return
    }

    setLoading(true)
    try {
      // Create Stripe checkout session for Artist Plan
      const response = await api.createCheckoutSession({
        priceId: 'price_1S2Lnh82fh30nyS6eACkYccJ', // Artist Plan price ID from Stripe setup
        successUrl: `${window.location.origin}/onboarding/complete?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/plans`
      })

      if (response.data?.success && response.data?.data?.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = response.data.data.checkoutUrl
      } else {
        throw new Error('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      toast.error('Failed to start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const artistFeatures = [
    'Unlimited music releases',
    'Song and lyric management',
    'Analytics and insights',
    'Label copy generation',
    'Split sheet management',
    'Content calendar',
    'Professional support'
  ]

  const managerFeatures = [
    'Everything in Artist Plan',
    'Multi-artist management',
    'Advanced analytics dashboard',
    'Team collaboration tools',
    'Priority support',
    'Custom integrations',
    'White-label options'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="mr-4 p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
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

      {/* Plan Selection */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600">
              Select the plan that best fits your music career goals
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Artist Plan */}
            <Card className="border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow duration-200 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white px-4 py-1 text-sm font-semibold">
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="text-center pb-6 pt-8">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  Artist Plan
                </CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-blue-600">$9.99</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
                <CardDescription className="text-gray-600 text-base">
                  Perfect for independent artists ready to take their career to the next level
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {artistFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => handleSelectPlan('artist')}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Start Artist Plan'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Manager Plan */}
            <Card className="border-2 border-gray-200 shadow-lg opacity-75 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gray-500 text-white px-4 py-1 text-sm font-semibold">
                  Coming Soon
                </Badge>
              </div>
              <CardHeader className="text-center pb-6 pt-8">
                <CardTitle className="text-2xl font-bold text-gray-600 mb-2">
                  Manager Plan
                </CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-500">$99.99</span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
                <CardDescription className="text-gray-500 text-base">
                  For music managers and labels managing multiple artists
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {managerFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  disabled
                  className="w-full bg-gray-300 text-gray-500 py-3 text-lg font-semibold rounded-lg cursor-not-allowed"
                >
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              All plans include a 30-day money-back guarantee
            </p>
            <p className="text-sm text-gray-500">
              Questions? Contact us at support@allaccessartist.com
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PlanSelection
