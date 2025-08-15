'use client'

import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function WorkerDashboard() {
  const { user, dbUser, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || !dbUser || dbUser.role !== 'WORKER')) {
      router.push('/auth/login')
    }
  }, [user, dbUser, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !dbUser || dbUser.role !== 'WORKER') {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Worker Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {dbUser.first_name} {dbUser.last_name}
            </p>
          </div>
          <Button variant="outline" onClick={signOut}>
            Sign out
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Jobs</CardTitle>
              <CardDescription>Your scheduled work</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Jobs today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hours This Week</CardTitle>
              <CardDescription>Total hours worked</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0h</p>
              <p className="text-sm text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Points</CardTitle>
              <CardDescription>Your Helprs points</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Total points</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Current Job</CardTitle>
              <CardDescription>Active work assignment</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No active job</p>
              <Button className="mt-4" disabled>
                Clock In
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Jobs</CardTitle>
              <CardDescription>Next scheduled work</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No upcoming jobs</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" disabled>
                Clock In
              </Button>
              <Button variant="outline" disabled>
                Clock Out
              </Button>
              <Button variant="outline">
                View Schedule
              </Button>
              <Button variant="outline">
                Update Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

