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
  const [nextJob, setNextJob] = useState<Job | null>(null)
  const [notifications, setNotifications] = useState(mockNotifications)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const TEST_WORKER_ID = 'worker-1' // Mock worker ID for testing

  // Load next upcoming job from API
  const loadNextJob = async () => {
    try {
      console.log('🔄 HomeScreen: Loading next job...');
      setError(null)
      const response = await apiService.getNextJob(TEST_WORKER_ID)
      console.log('✅ HomeScreen: Next job loaded successfully:', {
        hasNextJob: !!response.next_job,
        nextJob: response.next_job
      });
      setNextJob(response.next_job)
    } catch (err) {
      console.error('❌ HomeScreen: Failed to load next job:', {
        error: err,
        message: err?.message,
        code: err?.code,
        workerId: TEST_WORKER_ID
      });
      setError('Failed to load next job. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  // Refresh next job
  const onRefresh = async () => {
    setRefreshing(true)
    await loadNextJob()
    setRefreshing(false)
  }

  // Load next job on mount and set up auto-refresh
  useEffect(() => {
    loadNextJob()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadNextJob, 30000)
    
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

  const NextJobCard = ({ job }: { job: Job }) => (
    <View style={styles.nextJobCard}>
      <View style={styles.nextJobHeader}>
        <View style={styles.nextJobTypeContainer}>
          <Text style={styles.nextJobTypeText}>
            {job.appointment_type?.name || 'Job'}
          </Text>
        </View>
        <View style={styles.nextJobStatusBadge}>
          <Text style={styles.nextJobStatusText}>Next Up</Text>
        </View>
      </View>
      
      <Text style={styles.nextJobTitle}>{job.title}</Text>
      
      <View style={styles.nextJobDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#64748B" />
          <Text style={styles.detailText}>
            {job.scheduled_date} at {formatTime(job.scheduled_time)}
          </Text>
        </View>
        
        {job.estimated_duration && (
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#64748B" />
            <Text style={styles.detailText}>
              {Math.round(job.estimated_duration / 60)} hours
            </Text>
          </View>
        )}
        
        {job.location_address && (
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={1}>
              {job.location_address}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.nextJobFooter}>
        <View style={styles.nextJobPayContainer}>
          <Ionicons name="cash-outline" size={20} color="#10B981" />
          <Text style={styles.nextJobPayText}>
            ${job.calculated_pay || job.base_price}
          </Text>
        </View>
        <TouchableOpacity style={styles.viewJobButton}>
          <Text style={styles.viewJobButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
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
            <TouchableOpacity onPress={loadNextJob} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Next Upcoming Job Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Next Upcoming Job</Text>
            <TouchableOpacity onPress={loadNextJob}>
              <Text style={styles.seeAllText}>Refresh</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading next job...</Text>
            </View>
          ) : !nextJob ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="briefcase-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>No upcoming jobs</Text>
              <Text style={styles.emptySubtext}>Check the Jobs tab for available opportunities</Text>
            </View>
          ) : (
            <NextJobCard job={nextJob} />
          )}
        </View>

        {/* Points Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Points</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>View History</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.pointsCard}>
            <View style={styles.pointsContent}>
              <Ionicons name="star" size={24} color="#F59E0B" />
              <View style={styles.pointsTextContainer}>
                <Text style={styles.pointsValue}>1,250</Text>
                <Text style={styles.pointsLabel}>Total Points</Text>
              </View>
            </View>
            <View style={styles.pointsProgress}>
              <Text style={styles.pointsProgressText}>Next Level: 2,000</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '62.5%' }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Payments Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Payments</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.paymentsCard}>
            <View style={styles.paymentItem}>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentAmount}>$45.00</Text>
                <Text style={styles.paymentDate}>Today</Text>
              </View>
              <View style={styles.paymentStatus}>
                <Text style={styles.paymentStatusText}>Completed</Text>
              </View>
            </View>
            <View style={styles.paymentItem}>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentAmount}>$32.50</Text>
                <Text style={styles.paymentDate}>Yesterday</Text>
              </View>
              <View style={styles.paymentStatus}>
                <Text style={styles.paymentStatusText}>Completed</Text>
              </View>
            </View>
          </View>
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
  nextJobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  nextJobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nextJobTypeContainer: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  nextJobTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
  },
  nextJobStatusBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  nextJobStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  nextJobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  nextJobDetails: {
    marginBottom: 16,
  },
  nextJobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextJobPayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextJobPayText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
    marginLeft: 8,
  },
  viewJobButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewJobButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  pointsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  pointsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pointsTextContainer: {
    marginLeft: 12,
  },
  pointsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  pointsLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  pointsProgress: {
    marginTop: 8,
  },
  pointsProgressText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },
  paymentsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  paymentDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  paymentStatus: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#166534',
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

