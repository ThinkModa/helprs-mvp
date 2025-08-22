'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Activity,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function OrgAdminDashboard() {
  const { user, dbUser, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || !dbUser || dbUser.role !== 'ORG_ADMIN')) {
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

  if (!user || !dbUser || dbUser.role !== 'ORG_ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <h1 className="ml-3 text-xl font-semibold text-gray-900">Organization Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {dbUser.first_name} {dbUser.last_name}
              </span>
              <Button size="sm" asChild>
                <a href="/booking">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Appointment
                </a>
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Job
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-600">Manage your workforce and track performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+2</span> this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jobs Today</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">3 completed</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2,450</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Job Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4h</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">-0.3h</span> improvement
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Jobs */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Jobs</CardTitle>
                <CardDescription>Latest job assignments and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { 
                      title: "Kitchen Remodel - 123 Main St", 
                      status: "in_progress", 
                      worker: "John Smith", 
                      time: "2 hours ago",
                      duration: "4-6 hours"
                    },
                    { 
                      title: "Office Cleaning - Downtown", 
                      status: "completed", 
                      worker: "Sarah Johnson", 
                      time: "4 hours ago",
                      duration: "2 hours"
                    },
                    { 
                      title: "Plumbing Repair - 456 Oak Ave", 
                      status: "scheduled", 
                      worker: "Mike Davis", 
                      time: "6 hours ago",
                      duration: "1-2 hours"
                    },
                    { 
                      title: "Landscaping - Park View", 
                      status: "in_progress", 
                      worker: "Alex Wilson", 
                      time: "8 hours ago",
                      duration: "3-4 hours"
                    },
                  ].map((job, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {job.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : job.status === 'in_progress' ? (
                            <Clock className="h-5 w-5 text-blue-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{job.title}</h4>
                          <p className="text-sm text-gray-500">{job.worker} • {job.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          job.status === 'completed' ? 'default' : 
                          job.status === 'in_progress' ? 'secondary' : 'outline'
                        }>
                          {job.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-gray-500">{job.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common management tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" onClick={() => router.push('/dashboard/org-admin/schedule')}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Job
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => router.push('/dashboard/org-admin/workers')}>
                <Users className="h-4 w-4 mr-2" />
                Manage Workers
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => router.push('/dashboard/org-admin/customers')}>
                <Activity className="h-4 w-4 mr-2" />
                View Customers
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => router.push('/dashboard/org-admin/reports')}>
                <DollarSign className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Worker Status */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Worker Status</CardTitle>
              <CardDescription>Current availability and assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">8</div>
                  <p className="text-sm text-gray-600">Available</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">3</div>
                  <p className="text-sm text-gray-600">On Job</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">1</div>
                  <p className="text-sm text-gray-600">On Break</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">0</div>
                  <p className="text-sm text-gray-600">Offline</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
