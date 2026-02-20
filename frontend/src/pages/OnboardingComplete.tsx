import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Loader2, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/components/ui/sonner'
import { logger } from '@/lib/logger'
import api from '@/lib/api'

const TOTAL_STEPS = 3
const STEP_LABELS = ['Profile', 'Security', 'Review'] as const

type FieldErrors = {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
}

const OnboardingComplete = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { signIn } = useAuth()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [onboardingToken, setOnboardingToken] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  
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
    const onboardingTokenParam = searchParams.get('onboarding_token')

    if (sessionIdParam) {
      setSessionId(sessionIdParam)
      setOnboardingToken(onboardingTokenParam)
    } else {
      // No session ID means invalid access
      navigate('/plans')
    }
  }, [searchParams, navigate])

  const validateProfileStep = () => {
    const nextFieldErrors: FieldErrors = {}

    if (!fullName.trim()) {
      nextFieldErrors.fullName = 'Full name is required'
    }

    if (!email.trim()) {
      nextFieldErrors.email = 'Email is required'
    }

    setFieldErrors((prev) => ({
      ...prev,
      ...nextFieldErrors,
    }))

    if (Object.keys(nextFieldErrors).length > 0) {
      setError('Please correct the highlighted fields.')
      return false
    }

    return true
  }

  const validateSecurityStep = () => {
    const nextFieldErrors: FieldErrors = {}

    if (password.length < 8) {
      nextFieldErrors.password = 'Password must be at least 8 characters long'
    }

    if (password !== confirmPassword) {
      nextFieldErrors.confirmPassword = 'Passwords do not match'
    }

    setFieldErrors((prev) => ({
      ...prev,
      ...nextFieldErrors,
    }))

    if (Object.keys(nextFieldErrors).length > 0) {
      setError('Please correct the highlighted fields.')
      return false
    }

    return true
  }

  const handleNextStep = () => {
    setError(null)
    setFieldErrors({})

    if (currentStep === 1) {
      if (!validateProfileStep()) {
        return
      }
      setCurrentStep(2)
      return
    }

    if (currentStep === 2) {
      if (!validateSecurityStep()) {
        return
      }
      setCurrentStep(3)
    }
  }

  const handlePreviousStep = () => {
    setError(null)
    setFieldErrors({})
    setCurrentStep((prev) => Math.max(1, prev - 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setFieldErrors({})

    // Validation
    if (!validateProfileStep() || !validateSecurityStep()) {
      setLoading(false)
      return
    }

    if (!sessionId) {
      setError('Invalid session. Please return to plans and try again.')
      setLoading(false)
      return
    }

    try {
      // First, try to create fallback account in case webhook failed
      if (sessionId) {
        try {
          await api.createFallbackAccount(sessionId, onboardingToken)
        } catch (fallbackError) {
          // Fallback creation failed, but continue - account might already exist
          logger.warn('Fallback account creation not needed or failed', {
            sessionId,
            error: fallbackError,
          })
        }
      }

      // Complete onboarding by updating the user account
      const response = await api.completeOnboarding({
        session_id: sessionId,
        onboarding_token: onboardingToken,
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
        const errorMessage = response.error || 'Failed to complete onboarding'
        setError(errorMessage)
      }
    } catch (error) {
      logger.error('Error completing onboarding', {
        sessionId,
        email,
        error,
      })
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
      <div className="max-w-md mx-auto px-4 py-8 sm:py-16">
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
            <div className="mb-6 space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                <span>Step {currentStep} of {TOTAL_STEPS}</span>
                <span>{STEP_LABELS[currentStep - 1]}</span>
              </div>
              <Progress value={(currentStep / TOTAL_STEPS) * 100} className="h-2" />
              <div className="grid grid-cols-3 gap-2 text-xs">
                {STEP_LABELS.map((stepLabel, index) => {
                  const stepNumber = index + 1
                  const isActive = currentStep === stepNumber
                  const isComplete = currentStep > stepNumber

                  return (
                    <div
                      key={stepLabel}
                      className={`rounded-md border px-2 py-1 text-center ${
                        isComplete
                          ? 'border-primary/40 bg-primary/10 text-primary'
                          : isActive
                            ? 'border-primary/50 bg-primary/5 text-foreground'
                            : 'border-border/60 text-muted-foreground'
                      }`}
                    >
                      {stepLabel}
                    </div>
                  )
                })}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                if (currentStep < TOTAL_STEPS) {
                  e.preventDefault()
                  handleNextStep()
                  return
                }

                void handleSubmit(e)
              }}
              className="space-y-4"
            >
              {error && (
                <Alert variant="destructive" role="alert" aria-live="assertive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {currentStep === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-foreground">Full Name *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value)
                        if (fieldErrors.fullName) {
                          setFieldErrors((prev) => {
                            const next = { ...prev }
                            delete next.fullName
                            return next
                          })
                        }
                      }}
                      autoComplete="name"
                      enterKeyHint="next"
                      aria-invalid={Boolean(fieldErrors.fullName)}
                      aria-describedby={fieldErrors.fullName ? 'fullName-error' : undefined}
                      required
                      disabled={loading}
                      className={`bg-background/50 border-border/50 ${
                        fieldErrors.fullName ? 'border-destructive focus-visible:ring-destructive' : ''
                      }`}
                    />
                    {fieldErrors.fullName && (
                      <p id="fullName-error" className="text-sm text-destructive" role="alert">
                        {fieldErrors.fullName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (fieldErrors.email) {
                          setFieldErrors((prev) => {
                            const next = { ...prev }
                            delete next.email
                            return next
                          })
                        }
                      }}
                      autoComplete="email"
                      inputMode="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      enterKeyHint="next"
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                      required
                      disabled={loading}
                      className={`bg-background/50 border-border/50 ${
                        fieldErrors.email ? 'border-destructive focus-visible:ring-destructive' : ''
                      }`}
                    />
                    {fieldErrors.email && (
                      <p id="email-error" className="text-sm text-destructive" role="alert">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number (optional)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                      inputMode="tel"
                      enterKeyHint="next"
                      disabled={loading}
                      className="bg-background/50 border-border/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="artistName" className="text-foreground">Artist / Band Name</Label>
                    <Input
                      id="artistName"
                      type="text"
                      placeholder="Enter your artist or band name (optional)"
                      value={artistName}
                      onChange={(e) => setArtistName(e.target.value)}
                      autoComplete="organization"
                      enterKeyHint="next"
                      disabled={loading}
                      className="bg-background/50 border-border/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="referralCode" className="text-foreground">Referral Code</Label>
                    <Input
                      id="referralCode"
                      type="text"
                      placeholder="Enter referral code (optional)"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      autoComplete="off"
                      autoCapitalize="characters"
                      autoCorrect="off"
                      spellCheck={false}
                      enterKeyHint="next"
                      disabled={loading}
                      maxLength={6}
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <div className="rounded-md border border-border/60 bg-background/40 p-3 text-sm text-muted-foreground">
                    Use at least 8 characters. You can adjust this later in profile settings.
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password (min 8 characters)"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (fieldErrors.password) {
                          setFieldErrors((prev) => {
                            const next = { ...prev }
                            delete next.password
                            return next
                          })
                        }
                      }}
                      autoComplete="new-password"
                      enterKeyHint="next"
                      aria-invalid={Boolean(fieldErrors.password)}
                      aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                      required
                      disabled={loading}
                      minLength={8}
                      className={`bg-background/50 border-border/50 ${
                        fieldErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''
                      }`}
                    />
                    {fieldErrors.password && (
                      <p id="password-error" className="text-sm text-destructive" role="alert">
                        {fieldErrors.password}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        if (fieldErrors.confirmPassword) {
                          setFieldErrors((prev) => {
                            const next = { ...prev }
                            delete next.confirmPassword
                            return next
                          })
                        }
                      }}
                      autoComplete="new-password"
                      enterKeyHint="go"
                      aria-invalid={Boolean(fieldErrors.confirmPassword)}
                      aria-describedby={fieldErrors.confirmPassword ? 'confirm-password-error' : undefined}
                      required
                      disabled={loading}
                      className={`bg-background/50 border-border/50 ${
                        fieldErrors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''
                      }`}
                    />
                    {fieldErrors.confirmPassword && (
                      <p id="confirm-password-error" className="text-sm text-destructive" role="alert">
                        {fieldErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </>
              )}

              {currentStep === 3 && (
                <div className="space-y-4 rounded-lg border border-border/60 bg-background/40 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Review your details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-muted-foreground">Full Name</span>
                      <span className="text-right">{fullName || '—'}</span>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-muted-foreground">Email</span>
                      <span className="text-right break-all">{email || '—'}</span>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="text-right">{phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-muted-foreground">Artist / Band Name</span>
                      <span className="text-right">{artistName || 'Not provided'}</span>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-muted-foreground">Referral Code</span>
                      <span className="text-right">{referralCode || 'Not provided'}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use Back to edit anything before completing setup.
                  </p>
                </div>
              )}

              <div className="pt-2 flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreviousStep}
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                ) : (
                  <div className="hidden sm:block" />
                )}

                {currentStep < TOTAL_STEPS ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={loading}
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
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
                )}
              </div>
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
