'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/auth-context'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const { dbUser } = useAuth()
  const router = useRouter()

  const handleComplete = async () => {
    setLoading(true)
    // In a real app, you'd save onboarding preferences here
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
  }

  if (!dbUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Helprs!</CardTitle>
          <CardDescription>
            Let's get your account set up, {dbUser.first_name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎉</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Account Created Successfully!</h3>
              <p className="text-sm text-muted-foreground">
                Your company account has been created and you're ready to start managing your workforce.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">What's next?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Invite your first workers</li>
                  <li>• Create your first job</li>
                  <li>• Set up your calendar</li>
                  <li>• Configure payment settings</li>
                </ul>
              </div>

              <Button 
                onClick={handleComplete} 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'Setting up...' : 'Get Started'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

