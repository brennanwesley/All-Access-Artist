import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Music, ArrowLeft, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const LoginPage = () => {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: signInError } = await signIn(email, password)
    
    if (signInError) {
      setError(signInError.message || 'Failed to sign in')
    } else {
      navigate('/dashboard')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="max-w-md mx-auto px-4 py-8 sm:py-16">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Music className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to your All Access Artist account
            </CardDescription>
          </CardHeader>
            
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="next"
                  required
                  disabled={loading}
                  className="bg-background/50 border-border/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  enterKeyHint="go"
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
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/plans')}
                  className="text-primary hover:underline font-medium"
                >
                  Get started
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage
