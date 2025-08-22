import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
  Dimensions,
  Image,
  FlatList,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from '../../App'
import { apiService, Job } from '../services/api'

const { width } = Dimensions.get('window')

type JobTab = 'available' | 'my_jobs' | 'all_jobs'
type ViewMode = 'list' | 'map'

const TEST_WORKER_ID = 'worker-1' // Mock worker ID for testing

export default function JobsScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const [activeTab, setActiveTab] = useState<JobTab>('available')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split('T')[0])
  const scrollViewRef = useRef<ScrollView>(null)

  const loadJobs = async () => {
    try {
      console.log('🔄 JobsScreen: Loading jobs for tab:', activeTab);
      setError(null)
      let response
      
      switch (activeTab) {
        case 'available':
          response = await apiService.getAvailableJobs()
          break
        case 'my_jobs':
          response = await apiService.getMyJobs(TEST_WORKER_ID)
          break
        case 'all_jobs':
          response = await apiService.getAllJobs()
          break
      }
      
      console.log('✅ JobsScreen: Jobs loaded successfully:', {
        tab: activeTab,
        jobCount: response.jobs.length,
        jobs: response.jobs
      });
      
      setJobs(response.jobs)
    } catch (err) {
      console.error('❌ JobsScreen: Failed to load jobs:', {
        error: err,
        message: err?.message,
        code: err?.code,
        tab: activeTab,
        workerId: TEST_WORKER_ID
      });
      setError('Failed to load jobs. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadJobs()
    setRefreshing(false)
  }

  const acceptJob = async (jobId: string) => {
    try {
      await apiService.acceptJob(jobId, TEST_WORKER_ID)
      Alert.alert('Success', 'Job accepted successfully!')
      loadJobs() // Refresh the list
    } catch (err) {
      console.error('Failed to accept job:', err)
      Alert.alert('Error', 'Failed to accept job. Please try again.')
    }
  }

  useEffect(() => {
    loadJobs()
  }, [activeTab])

  // Auto-select first job date when jobs change
  useEffect(() => {
    if (jobs.length > 0) {
      const firstJobDate = jobs[0].scheduled_date
      if (firstJobDate) {
        setSelectedDate(firstJobDate)
      }
    }
  }, [jobs])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return 'TBD'
    const [hourStr, minuteRest] = timeString.split(':')
    const minutes = (minuteRest || '00').slice(0, 2)
    let hours = parseInt(hourStr, 10)
    if (Number.isNaN(hours)) return 'TBD'
    const ampm = hours >= 12 ? 'pm' : 'am'
    hours = hours % 12 || 12
    return `${hours}:${minutes} ${ampm}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return '#10B981'
      case 'scheduling':
        return '#F59E0B'
      case 'scheduled':
        return '#3B82F6'
      case 'in_progress':
        return '#8B5CF6'
      case 'complete':
        return '#6B7280'
      default:
        return '#6B7280'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Open'
      case 'scheduling':
        return 'Scheduling'
      case 'scheduled':
        return 'Scheduled'
      case 'in_progress':
        return 'In Progress'
      case 'complete':
        return 'Complete'
      default:
        return status
    }
  }

  // Sort jobs by date and time (most recent first)
  const sortJobsByDate = (jobsToSort: Job[]) => {
    return jobsToSort.sort((a, b) => {
      const dateA = new Date(`${a.scheduled_date}T${a.scheduled_time}`)
      const dateB = new Date(`${b.scheduled_date}T${b.scheduled_time}`)
      return dateA.getTime() - dateB.getTime() // Ascending order (earliest first)
    })
  }

  // Group jobs by date
  const groupJobsByDate = (jobsToGroup: Job[]) => {
    const grouped: { [key: string]: Job[] } = {}
    
    jobsToGroup.forEach(job => {
      const dateKey = job.scheduled_date
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(job)
    })
    
    return grouped
  }

  // Generate dates for date picker and list view
  const generateDateWindows = () => {
    const dates = []
    const today = new Date()
    
    // Generate dates for the next 365 days (1 year)
    for (let i = 0; i < 365; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dateString = date.toISOString().split('T')[0]
      dates.push(dateString)
    }
    
    return dates
  }

  // Generate only dates that have jobs (for infinite scroll)
  const generateJobDates = () => {
    const jobDates = new Set()
    jobs.forEach(job => {
      if (job.scheduled_date) {
        jobDates.add(job.scheduled_date)
      }
    })
    return Array.from(jobDates).sort()
  }

  // Generate all dates for date picker (scrollable)
  const generateDatePickerWindow = () => {
    return generateDateWindows()
  }

  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString)
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    
    const dayName = dayNames[date.getDay()]
    const month = monthNames[date.getMonth()]
    const day = date.getDate()
    const year = date.getFullYear()
    
    return {
      dayName,
      month,
      day,
      year,
      fullDate: `${dayName}, ${month} ${day}, ${year}`
    }
  }

  // Scroll to selected date
  const scrollToDate = (date: string) => {
    setSelectedDate(date)
    // Find the date separator and scroll to it
    if (scrollViewRef.current) {
      // Simple scroll to approximate position
      const jobDates = generateJobDates()
      const dateIndex = jobDates.indexOf(date)
      const estimatedPosition = dateIndex * 400 // Rough estimate
      scrollViewRef.current.scrollTo({
        y: Math.max(0, estimatedPosition),
        animated: true
      })
    }
  }

  const JobCard = ({ job }: { job: Job }) => {
    // Calculate end time for non-available jobs
    const getTimeDisplay = () => {
      if (job.status === 'open') {
        // For available jobs, show duration
        return job.estimated_duration ? `${Math.round(job.estimated_duration / 60)} hours` : 'Duration TBD'
      } else {
        // For accepted/non-available jobs, show start and end time
        if (job.scheduled_time && job.estimated_duration) {
          const startTime = new Date(`2000-01-01T${job.scheduled_time}`)
          const endTime = new Date(startTime.getTime() + job.estimated_duration * 60000)
          const endTimeString = endTime.toTimeString().substring(0, 5)
          return `${formatTime(job.scheduled_time)} - ${endTimeString}`
        }
        return formatTime(job.scheduled_time)
      }
    }

    return (
      <View style={styles.jobCard}>
        {/* Map Section with Accept Button Overlay - Only show when NOT in map view */}
        {viewMode !== 'map' && (
          <View style={styles.mapSection}>
            <View style={styles.mapPlaceholder}>
              <Ionicons name="location" size={32} color="#3B82F6" />
              <Text style={styles.mapLocationText}>
                {job.location_address || 'Location TBD'}
              </Text>
            </View>
            
            {/* Status Badge Overlay */}
            <View style={[styles.statusBadgeOverlay, { backgroundColor: getStatusColor(job.status) }]}>
              <Text style={styles.statusText}>{getStatusText(job.status)}</Text>
            </View>
          </View>
        )}

        {/* Job Content */}
        <View style={styles.jobContent}>
          {/* Customer Name - Only show for accepted jobs */}
          {job.status !== 'open' && job.customer && (
            <View style={styles.customerContainer}>
              <Text style={styles.customerName}>
                {job.customer.first_name} {job.customer.last_name}
              </Text>
            </View>
          )}

          {/* Job Type and Pay */}
          <View style={styles.jobHeader}>
            <View style={styles.jobTypeContainer}>
              <Text style={styles.jobTypeText}>
                {job.appointment_type?.name || 'Job'}
              </Text>
            </View>
            <View style={styles.payContainer}>
              <Ionicons name="cash-outline" size={16} color="#10B981" />
              <Text style={styles.payText}>
                ${job.calculated_pay || job.base_price}
              </Text>
            </View>
          </View>
          
          {/* Status Badge - Show when in map view */}
          {viewMode === 'map' && (
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
              <Text style={styles.statusText}>{getStatusText(job.status)}</Text>
            </View>
          )}

                  {/* Job Details */}
        <View style={styles.jobDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#64748B" />
            <Text style={styles.detailText}>
              {formatDate(job.scheduled_date)} at {formatTime(job.scheduled_time)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#64748B" />
            <Text style={styles.detailText}>
              {getTimeDisplay()}
            </Text>
          </View>
        </View>

        {/* Accept Button - Only for available jobs */}
        {activeTab === 'available' && job.status === 'open' && (
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={() => acceptJob(job.id)}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        )}
        </View>
      </View>
    )
  }

  const DatePicker = () => {
    const datePickerDates = generateDatePickerWindow()
    
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.datePickerContainer}
        contentContainerStyle={styles.datePickerContent}
      >
        {datePickerDates.map((date, index) => {
          const dateInfo = formatDateForDisplay(date)
          const isSelected = selectedDate === date
          const hasJobs = jobs.some(job => job.scheduled_date === date)
          const isToday = date === new Date().toISOString().split('T')[0]
          
          return (
            <TouchableOpacity
              key={`picker-${date}-${index}-${Date.now()}`}
              style={[
                styles.datePickerItem, 
                isSelected && styles.datePickerItemSelected,
                isToday && styles.datePickerItemToday
              ]}
              onPress={() => scrollToDate(date)}
            >
              <Text style={[
                styles.datePickerDay, 
                isSelected && styles.datePickerDaySelected,
                isToday && styles.datePickerDayToday
              ]}>
                {dateInfo.dayName.charAt(0)}
              </Text>
              <Text style={[
                styles.datePickerDate, 
                isSelected && styles.datePickerDateSelected,
                isToday && styles.datePickerDateToday
              ]}>
                {dateInfo.day}
              </Text>
              {hasJobs && <View style={styles.datePickerDot} />}
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    )
  }

  const MapView = () => (
    <View style={styles.mapContainer}>
      <View style={styles.mapPlaceholder}>
        <Ionicons name="map-outline" size={64} color="#CBD5E1" />
        <Text style={styles.mapPlaceholderText}>Map View Coming Soon</Text>
        <Text style={styles.mapPlaceholderSubtext}>
          Earning potential bubbles will be displayed here
        </Text>
      </View>
    </View>
  )

  const ListView = () => {
    const sortedJobs = sortJobsByDate(jobs)
    const groupedJobs = groupJobsByDate(sortedJobs)
    
    return (
      <ScrollView 
        ref={scrollViewRef}
        style={styles.jobsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading jobs...</Text>
          </View>
        ) : jobs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>
              {activeTab === 'available' 
                ? 'No jobs available'
                : activeTab === 'my_jobs'
                ? 'No jobs found'
                : 'No jobs available'
              }
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'available' 
                ? 'No jobs available'
                : activeTab === 'my_jobs'
                ? 'You haven\'t accepted any jobs yet'
                : 'No jobs available'
              }
            </Text>
          </View>
        ) : (
          Object.keys(groupedJobs).sort().map((date, index) => {
            const jobsForDate = groupedJobs[date] || []
            const dateInfo = formatDateForDisplay(date)
            
            return (
              <View key={`list-${date}-${index}-${Date.now()}`}>
                {/* Date Separator */}
                <View style={[styles.dateSeparator, index === 0 && { marginTop: 0 }]}>
                  <Text style={styles.dateSeparatorText}>{dateInfo.fullDate}</Text>
                  <Text style={styles.dateSeparatorCount}>
                    {jobsForDate.length} job{jobsForDate.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                
                {/* Jobs for this date */}
                {jobsForDate.map((job) => (
                  <TouchableOpacity
                    key={job.id}
                    onPress={() => {
                      // Only allow navigation for accepted jobs in My Jobs tab
                      if (activeTab === 'my_jobs' && job.status !== 'open') {
                        navigation.navigate('JobDetails', { 
                          job, 
                          isAccepted: true 
                        })
                      } else if (activeTab === 'available' || activeTab === 'all_jobs') {
                        // Show unaccepted job view for available/all jobs
                        navigation.navigate('JobDetails', { 
                          job, 
                          isAccepted: false 
                        })
                      }
                    }}
                    disabled={activeTab === 'my_jobs' && job.status === 'open'}
                  >
                    <JobCard job={job} />
                  </TouchableOpacity>
                ))}
              </View>
            )
          })
        )}
      </ScrollView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Jobs</Text>
        <TouchableOpacity 
          style={styles.viewToggle}
          onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
        >
          <Ionicons 
            name={viewMode === 'list' ? 'map-outline' : 'list-outline'} 
            size={24} 
            color="#3B82F6" 
          />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'available' && styles.activeTab]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
            Available
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'my_jobs' && styles.activeTab]}
          onPress={() => setActiveTab('my_jobs')}
        >
          <Text style={[styles.tabText, activeTab === 'my_jobs' && styles.activeTabText]}>
            My Jobs
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'all_jobs' && styles.activeTab]}
          onPress={() => setActiveTab('all_jobs')}
        >
          <Text style={[styles.tabText, activeTab === 'all_jobs' && styles.activeTabText]}>
            All Jobs
          </Text>
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

      {/* Date Picker */}
      {viewMode === 'list' && jobs.length > 0 && <DatePicker />}

      {/* Content */}
      {viewMode === 'list' ? <ListView /> : <MapView />}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  viewToggle: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 16,
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
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingTop: 12,
    paddingBottom: 22,
    height: 80,
  },
  datePickerContent: {
    paddingHorizontal: 16,
  },
  datePickerItem: {
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    minWidth: 32,
    height: 46,
  },
  datePickerItemSelected: {
    backgroundColor: '#3B82F6',
  },
  datePickerItemToday: {
    borderWidth: 1,
    borderColor: '#10B981',
  },
  datePickerDay: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 1,
    lineHeight: 12,
  },
  datePickerDaySelected: {
    color: '#FFFFFF',
  },
  datePickerDayToday: {
    color: '#10B981',
  },
  datePickerDate: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
    lineHeight: 16,
  },
  datePickerDateSelected: {
    color: '#FFFFFF',
  },
  datePickerDateToday: {
    color: '#10B981',
  },
  datePickerDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#10B981',
    marginTop: 2,
  },
  dateSeparator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginTop: 8,
    marginBottom: 8,
  },
  dateSeparatorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  dateSeparatorCount: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  jobsList: {
    paddingHorizontal: 16,
  },
  jobsListContent: {
    paddingTop: 0,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  mapSection: {
    height: 200,
    backgroundColor: '#F1F5F9',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapLocationText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    fontWeight: '500',
  },
  acceptButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadgeOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  customerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  jobTypeContainer: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  jobTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  jobContent: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
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
    flex: 1,
  },
  payContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginLeft: 8,
  },

  mapContainer: {
    backgroundColor: '#FFFFFF',
    height: 400,
  },

  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
    textAlign: 'center',
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
})
