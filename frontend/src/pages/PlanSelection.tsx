import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Star, ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '@/lib/api'

const PlanSelection = () => {
  const [loading, setLoading] = useState(false)
  const [artistPriceId, setArtistPriceId] = useState<string | null>(null)

  useEffect(() => {
    // Fetch available products and get the Artist Plan price ID
    const fetchProducts = async () => {
      try {
        const response = await api.getSubscriptionProducts()
        if (response.data?.success && response.data?.data?.length > 0) {
          // Find the Artist Plan product
          const artistProduct = response.data.data.find((product: any) => 
            product.name?.toLowerCase().includes('artist')
          )
          if (artistProduct?.prices?.[0]?.id) {
            setArtistPriceId(artistProduct.prices[0].id)
          }
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
        // Fallback to hardcoded price ID if API fails
        setArtistPriceId('price_1S2Lnh82fh30nyS6eACkYccJ')
      }
    }

    fetchProducts()
  }, [])

  const handleSelectPlan = async (planType: 'artist' | 'manager') => {
    if (planType === 'manager') {
      toast('Manager Plan coming soon!', { icon: '🚀' })
      return
    }

    if (!artistPriceId) {
      toast.error('Unable to load pricing. Please refresh the page.')
      return
    }

    setLoading(true)
    try {
      // Create Stripe checkout session for Artist Plan
      const response = await api.createCheckoutSession({
        priceId: artistPriceId,
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

  const handleArtistPlanSelect = () => {
    handleSelectPlan('artist')
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select the perfect plan to accelerate your music career and unlock your full potential.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Artist Plan */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-blue-500/10" />
            <CardHeader className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star className="h-6 w-6 text-primary" />
                  <CardTitle className="text-2xl text-foreground">Artist Plan</CardTitle>
                </div>
                <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
              </div>
              <div className="mb-4">
                <span className="text-4xl font-bold text-foreground">$9.99</span>
                <span className="text-muted-foreground ml-2">/month</span>
              </div>
              <CardDescription className="text-muted-foreground">
                Perfect for independent artists ready to take their career to the next level.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <ul className="space-y-3 mb-8">
                {artistFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                onClick={handleArtistPlanSelect}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg font-semibold"
              >
                {loading ? 'Processing...' : 'Select'}
              </Button>
            </CardContent>
          </Card>

            {/* Manager Plan */}
          <Card className="bg-card/30 backdrop-blur-sm border-border/30 relative overflow-hidden opacity-60">
            <div className="absolute inset-0 bg-gradient-to-br from-muted/10 to-muted/20" />
            <CardHeader className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Crown className="h-6 w-6 text-yellow-400" />
                  <CardTitle className="text-2xl text-foreground">Manager Plan</CardTitle>
                </div>
                <Badge className="bg-yellow-600 text-white">Coming Soon</Badge>
              </div>
              <div className="mb-4">
                <span className="text-4xl font-bold text-foreground">$99.99</span>
                <span className="text-muted-foreground ml-2">/month</span>
              </div>
              <CardDescription className="text-muted-foreground">
                Comprehensive management tools for labels and artist managers.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <ul className="space-y-3 mb-8">
                {managerFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                disabled
                className="w-full bg-muted text-muted-foreground py-3 text-lg font-semibold cursor-not-allowed"
              >
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <Card className="bg-card/30 backdrop-blur-sm border-border/30 p-6">
            <p className="text-muted-foreground mb-4">
              All plans include a 7-day free trial. Cancel anytime.
            </p>
            <p className="text-sm text-muted-foreground">
              Questions? Contact us at support@allaccessartist.com
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PlanSelection
