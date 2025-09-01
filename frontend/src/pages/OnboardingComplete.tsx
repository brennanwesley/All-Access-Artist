import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import api from '@/lib/api'

const OnboardingComplete = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { signIn } = useAuth()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  
  // Form fields in specified order
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [artistName, setArtistName] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    const sessionIdParam = searchParams.get('session_id')
    if (sessionIdParam) {
      setSessionId(sessionIdParam)
    } else {
      // No session ID means invalid access
      navigate('/plans')
    }
  }, [searchParams, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Full name, email, and password are required')
      setLoading(false)
      return
    }

    try {
      // First, try to create fallback account in case webhook failed
      if (sessionId) {
        try {
          await api.createFallbackAccount(sessionId)
        } catch (fallbackError) {
          // Fallback creation failed, but continue - account might already exist
          console.log('Fallback account creation not needed or failed:', fallbackError)
        }
      }

      // Complete onboarding by updating the user account
      const response = await api.completeOnboarding({
        session_id: sessionId,
        full_name: fullName,
        email: email,
        phone: phone || null,
        artist_name: artistName || null,
        referral_code: referralCode || null,
        password: password
      })

      if (response.data?.success) {
        // Account setup complete, now sign in
        const { error: signInError } = await signIn(email, password)
        
        if (signInError) {
          setError('Account created but sign in failed. Please try signing in manually.')
        } else {
          toast.success('Welcome to All Access Artist!')
          navigate('/dashboard')
        }
      } else {
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : response.error?.message || 'Failed to complete onboarding'
        setError(errorMessage)
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
      setError('Failed to complete onboarding. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-destructive">Invalid Access</CardTitle>
            <CardDescription className="text-muted-foreground">
              This page requires a valid payment session. Please start over.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/plans')} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Back to Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="max-w-md mx-auto px-4 py-16">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Payment Successful!
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Complete your account setup to start using All Access Artist
            </CardDescription>
          </CardHeader>
            
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-foreground">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-background/50 border-border/50"
                />
              </div>
              
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-background/50 border-border/50"
                />
              </div>
              
              {/* Phone (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number (optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  className="bg-background/50 border-border/50"
                />
              </div>
              
              {/* Artist/Band Name (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="artistName" className="text-foreground">Artist / Band Name</Label>
                <Input
                  id="artistName"
                  type="text"
                  placeholder="Enter your artist or band name (optional)"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  disabled={loading}
                  className="bg-background/50 border-border/50"
                />
              </div>
              
              {/* Referral Code (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="referralCode" className="text-foreground">Referral Code</Label>
                <Input
                  id="referralCode"
                  type="text"
                  placeholder="Enter referral code (optional)"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  disabled={loading}
                  maxLength={6}
                  className="bg-background/50 border-border/50"
                />
              </div>
              
              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password (min 8 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={8}
                  className="bg-background/50 border-border/50"
                />
              </div>
              
              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-background/50 border-border/50"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up your account...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                By completing setup, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default OnboardingComplete
