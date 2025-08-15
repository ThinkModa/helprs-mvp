import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import GlobalStyles from '../styles/GlobalStyles'
import { apiService, Job } from '../services/api'

const mockNotifications = [
  {
    id: '1',
    title: 'New Job Assigned',
    message: 'You have been assigned to a new cleaning job',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: '2',
    title: 'Payment Received',
    message: 'You received a payment of $45.00',
    time: '1 day ago',
    unread: false,
  },
]

export default function HomeScreen() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [notifications, setNotifications] = useState(mockNotifications)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load jobs from API
  const loadJobs = async () => {
    try {
      setError(null)
      const response = await apiService.getOpenJobs()
      setJobs(response.jobs)
    } catch (err) {
      console.error('Failed to load jobs:', err)
      setError('Failed to load jobs. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  // Refresh jobs
  const onRefresh = async () => {
    setRefreshing(true)
    await loadJobs()
    setRefreshing(false)
  }

  // Load jobs on mount and set up auto-refresh
  useEffect(() => {
    loadJobs()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadJobs, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const calculateEarnings = (job: Job) => {
    // Calculate earnings based on base price and duration
    const hours = (job.estimated_duration || 0) / 60
    const hourlyRate = 25 // Mock hourly rate for now
    return Math.max(hours * hourlyRate, job.base_price).toFixed(2)
  }

  const formatTime = (time: string) => {
    return time.substring(0, 5) // Convert "09:00" to "9:00 AM" format
  }

  const JobCard = ({ job }: { job: Job }) => (
    <TouchableOpacity style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <View style={styles.jobCategory}>
          <Text style={styles.categoryText}>
            {job.appointment_type?.name || 'Job'}
          </Text>
        </View>
        <Text style={styles.earningsText}>${job.base_price}</Text>
      </View>
      
      <Text style={styles.jobTitle}>{job.title}</Text>
      {job.description && (
        <Text style={styles.jobDescription}>{job.description}</Text>
      )}
      
      <View style={styles.jobDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#64748B" />
          <Text style={styles.detailText}>
            {job.scheduled_date} at {formatTime(job.scheduled_time)}
          </Text>
        </View>
        
        {job.estimated_duration && (
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#64748B" />
            <Text style={styles.detailText}>{job.estimated_duration} minutes</Text>
          </View>
        )}
        
        {job.location_address && (
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#64748B" />
            <Text style={styles.detailText}>{job.location_address}</Text>
          </View>
        )}
        
        <View style={styles.detailRow}>
          <Ionicons name="people-outline" size={16} color="#64748B" />
          <Text style={styles.detailText}>
            {job.accepted_workers}/{job.required_workers} workers
          </Text>
        </View>

        {job.customer && (
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={16} color="#64748B" />
            <Text style={styles.detailText}>
              {job.customer.first_name} {job.customer.last_name}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.jobFooter}>
        <View style={styles.pointsContainer}>
          <Ionicons name="star" size={16} color="#F59E0B" />
          <Text style={styles.pointsText}>150 points</Text>
        </View>
        <View style={styles.earningsContainer}>
          <Ionicons name="cash-outline" size={16} color="#10B981" />
          <Text style={styles.earningsText}>${calculateEarnings(job)}/hr</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  const NotificationItem = ({ notification }: { notification: any }) => (
    <TouchableOpacity style={[styles.notificationItem, notification.unread && styles.unreadNotification]}>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{notification.title}</Text>
        <Text style={styles.notificationMessage}>{notification.message}</Text>
        <Text style={styles.notificationTime}>{notification.time}</Text>
      </View>
      {notification.unread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome, John!</Text>
            <Text style={styles.subtitleText}>Ready for today's jobs?</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle" size={40} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadJobs} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Upcoming Jobs Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Jobs</Text>
            <TouchableOpacity onPress={loadJobs}>
              <Text style={styles.seeAllText}>Refresh</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading jobs...</Text>
            </View>
          ) : jobs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="briefcase-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>No jobs available</Text>
              <Text style={styles.emptySubtext}>Check back later for new opportunities</Text>
            </View>
          ) : (
            jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))
          )}
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  subtitleText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#64748B',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 12,
  },
  emptySubtext: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobCategory: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  jobDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 20,
  },
  jobDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '500',
    marginLeft: 4,
  },
  earningsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  earningsText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 4,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unreadNotification: {
    backgroundColor: '#F8FAFC',
    borderColor: '#3B82F6',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginLeft: 8,
  },
})

