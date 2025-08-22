import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Animated,
  PanResponder,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Job, FormResponse } from '../services/api'
import { apiService } from '../services/api'

const TEST_WORKER_ID = 'worker-1' // Mock worker ID for testing

interface JobDetailsScreenProps {
  route: {
    params: {
      job: Job
      isAccepted?: boolean
    }
  }
}

export default function JobDetailsScreen({ route }: JobDetailsScreenProps) {
  const { job: initialJob, isAccepted: initialIsAccepted = false } = route.params
  const [job, setJob] = useState(initialJob)
  const [isAccepted, setIsAccepted] = useState(initialIsAccepted)
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false)
  const [formResponses, setFormResponses] = useState<FormResponse[]>([])
  const [isAcceptingJob, setIsAcceptingJob] = useState(false)
  
  // Clock in/out state management
  const [isJobActive, setIsJobActive] = useState(false)
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [isClockingIn, setIsClockingIn] = useState(false)
  const [isClockingOut, setIsClockingOut] = useState(false)
  const [clockInTime, setClockInTime] = useState<Date | null>(null)
  const [clockOutTime, setClockOutTime] = useState<Date | null>(null)
  const [timeSpent, setTimeSpent] = useState<string>('')
  const [jobComplete, setJobComplete] = useState(false)
  
  // Animation values for swipe gestures
  const translateX = useRef(new Animated.Value(0)).current
  const swipeProgress = useRef(new Animated.Value(0)).current
  const [isSwiping, setIsSwiping] = useState(false)

  useEffect(() => {
    const fetchFormResponses = async () => {
      if (job.id) {
        try {
          const response = await apiService.getFormResponses(job.id)
          setFormResponses(response.form_responses)
        } catch (error) {
          console.error('Error fetching form responses:', error)
        }
      }
    }
    fetchFormResponses()
  }, [job.id])

  const calculateEarnings = (job: Job) => {
    const hours = (job.estimated_duration || 0) / 60
    const hourlyRate = 25
    return (hours * hourlyRate).toFixed(2)
  }

  const formatDate = (dateString: string) => {
    // Parse date without timezone conversion by creating date in local timezone
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day) // month is 0-indexed
    
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric' 
      })
    }
  }

  const formatTime = (time: string | null) => {
    if (!time) return 'TBD'
    // Support HH:MM or HH:MM:SS formats
    const [hourStr, minuteRest] = time.split(':')
    const minutes = (minuteRest || '00').slice(0, 2)
    let hours = parseInt(hourStr, 10)
    if (Number.isNaN(hours)) return 'TBD'
    const ampm = hours >= 12 ? 'pm' : 'am'
    hours = hours % 12 || 12
    return `${hours}:${minutes} ${ampm}`
  }

  const calculateEndTime = (startTime: string | null, duration: number | null) => {
    if (!startTime || !duration) return 'TBD'
    const start = new Date(`2000-01-01T${startTime}`)
    const end = new Date(start.getTime() + duration * 60000)
    const hours24 = end.getHours()
    const minutes = end.getMinutes().toString().padStart(2, '0')
    const ampm = hours24 >= 12 ? 'pm' : 'am'
    const hours12 = (hours24 % 12) || 12
    return `${hours12}:${minutes} ${ampm}`
  }

  const handleSwipeToAccept = async () => {
    if (isAcceptingJob) return // Prevent multiple calls
    
    setIsAcceptingJob(true)
    try {
      console.log('Accepting job:', job.id)
      const response = await apiService.acceptJob(job.id, TEST_WORKER_ID)
      
      if (response.success) {
        // Update local state to reflect accepted job
        setJob(prevJob => ({
          ...prevJob,
          status: response.job_status,
          assigned_worker_id: TEST_WORKER_ID,
          assignment_date: new Date().toISOString(),
        }))
        setIsAccepted(true)
        
        // Show success message briefly
        Alert.alert(
          'Job Accepted!',
          `Successfully accepted the job. Status: ${response.job_status}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Job details will now show as accepted
              }
            }
          ]
        )
      } else {
        Alert.alert('Error', 'Failed to accept job. Please try again.')
      }
    } catch (error) {
      console.error('Error accepting job:', error)
      Alert.alert('Error', 'Failed to accept job. Please check your connection and try again.')
    } finally {
      setIsAcceptingJob(false)
    }
  }

  // PanResponder for job acceptance
  const acceptPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsSwiping(true)
        translateX.setValue(0)
        swipeProgress.setValue(0)
      },
      onPanResponderMove: (_, gestureState) => {
        const translationX = Math.max(0, gestureState.dx)
        translateX.setValue(translationX)
        const progress = Math.max(0, Math.min(1, translationX / 200)) // 200px threshold
        swipeProgress.setValue(progress)
      },
      onPanResponderRelease: (_, gestureState) => {
        const translationX = gestureState.dx
        
        if (translationX > 150) { // Swipe threshold
          // Trigger job acceptance
          handleSwipeToAccept()
        }
        
        // Reset animations
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(swipeProgress, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
        ]).start()
        
        setIsSwiping(false)
      },
    })
  ).current

  // PanResponder for clock in
  const clockInPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsSwiping(true)
        translateX.setValue(0)
        swipeProgress.setValue(0)
      },
      onPanResponderMove: (_, gestureState) => {
        const translationX = Math.max(0, gestureState.dx)
        translateX.setValue(translationX)
        const progress = Math.max(0, Math.min(1, translationX / 200))
        swipeProgress.setValue(progress)
      },
      onPanResponderRelease: (_, gestureState) => {
        const translationX = gestureState.dx
        
        if (translationX > 150) {
          handleClockIn()
        }
        
        // Reset animations
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(swipeProgress, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
        ]).start()
        
        setIsSwiping(false)
      },
    })
  ).current

  // PanResponder for clock out
  const clockOutPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsSwiping(true)
        translateX.setValue(0)
        swipeProgress.setValue(0)
      },
      onPanResponderMove: (_, gestureState) => {
        const translationX = Math.max(0, gestureState.dx)
        translateX.setValue(translationX)
        const progress = Math.max(0, Math.min(1, translationX / 200))
        swipeProgress.setValue(progress)
      },
      onPanResponderRelease: (_, gestureState) => {
        const translationX = gestureState.dx
        
        if (translationX > 150) {
          handleClockOut()
        }
        
        // Reset animations
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(swipeProgress, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
        ]).start()
        
        setIsSwiping(false)
      },
    })
  ).current

  const handleActivateJob = () => {
    setIsJobActive(true)
    Alert.alert('Job Activated', 'Job is now active for clock in/out functionality.')
  }

  const handleClockIn = async () => {
    if (isClockingIn) return
    
    setIsClockingIn(true)
    try {
      const response = await apiService.clockIn(job.id, TEST_WORKER_ID)
      
      if (response.success) {
        const now = new Date()
        setClockInTime(now)
        setIsClockedIn(true)
        Alert.alert('Clocked In!', `Started work at ${now.toLocaleTimeString()}`)
      } else {
        Alert.alert('Error', response.error || 'Failed to clock in')
      }
    } catch (error) {
      console.error('Error clocking in:', error)
      Alert.alert('Error', 'Failed to clock in. Please try again.')
    } finally {
      setIsClockingIn(false)
    }
  }

  const handleClockOut = async () => {
    if (isClockingOut || !isClockedIn) return
    
    setIsClockingOut(true)
    try {
      const response = await apiService.clockOut(job.id, TEST_WORKER_ID)
      
      if (response.success) {
        const now = new Date()
        setClockOutTime(now)
        
        // Use the hours worked from the API response
        const hoursWorked = response.hours_worked || 0
        const hours = Math.floor(hoursWorked)
        const minutes = Math.floor((hoursWorked - hours) * 60)
        const timeSpentStr = `${hours}h ${minutes}m`
        setTimeSpent(timeSpentStr)
        
        setIsClockedIn(false)
        setJobComplete(true)
        
        Alert.alert('Clocked Out!', `Work completed. Time spent: ${timeSpentStr}`)
      } else {
        Alert.alert('Error', response.error || 'Failed to clock out')
      }
    } catch (error) {
      console.error('Error clocking out:', error)
      Alert.alert('Error', 'Failed to clock out. Please try again.')
    } finally {
      setIsClockingOut(false)
    }
  }

  const handleResources = () => {
    // TODO: Implement resources functionality
    console.log('Resources pressed')
  }

  const handleAdditionalDetails = () => {
    setShowAdditionalDetails(!showAdditionalDetails)
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {job.appointment_type?.name || 'Job Category'}
          </Text>
        </View>

        {/* Image/Map Section */}
        <View style={styles.imageMapContainer}>
          <View style={styles.imageMapPlaceholder}>
            <Ionicons name="location" size={48} color="#64748B" />
            <Text style={styles.imageMapText}>Image of Home OR Map Location</Text>
          </View>
        </View>

        {/* Job Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="location" size={20} color="#64748B" />
            <Text style={styles.statLabel}>
              {job.location_address ? 'Distance from location' : 'Location TBD'}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time" size={20} color="#64748B" />
            <Text style={styles.statLabel}>
              {job.scheduled_time ? 'Est. Drive Time' : 'Time TBD'}
            </Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.teamIcons}>
              <Ionicons name="happy" size={16} color="#64748B" />
              <Ionicons name="happy" size={16} color="#64748B" />
              <Ionicons name="happy" size={16} color="#64748B" />
            </View>
            <Text style={styles.statLabel}>Team</Text>
          </View>
        </View>

        {/* Job Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{formatDate(job.scheduled_date)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Start Time</Text>
            <Text style={styles.detailValue}>
              {formatTime(job.scheduled_time)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Est. Finish Time</Text>
            <Text style={styles.detailValue}>
              {calculateEndTime(job.scheduled_time, job.estimated_duration)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Service Type</Text>
            <Text style={styles.detailValue}>{job.appointment_type?.name || 'General Service'}</Text>
          </View>
          {/* Job Size - Only show if it's available and not null */}
          {job.estimated_duration && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Job Size</Text>
              <Text style={styles.detailValue}>{job.estimated_duration} min</Text>
            </View>
          )}
          {isAccepted && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Customer Name</Text>
                <Text style={styles.detailValue}>
                  {job.customer ? `${job.customer.first_name} ${job.customer.last_name}` : 'N/A'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Customer #</Text>
                <Text style={styles.detailValue}>{job.customer?.phone || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Address</Text>
                <Text style={styles.detailValue}>{job.location_address || 'N/A'}</Text>
              </View>
            </>
          )}
        </View>

        {/* Additional Details Button */}
        <TouchableOpacity style={styles.additionalDetailsButton} onPress={handleAdditionalDetails}>
          <Text style={styles.additionalDetailsText}>Additional Details</Text>
          <Ionicons 
            name={showAdditionalDetails ? "remove" : "add"} 
            size={24} 
            color="#64748B" 
          />
        </TouchableOpacity>

        {/* Additional Details Content */}
        {showAdditionalDetails && (
          <View style={styles.additionalDetailsContent}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailValue}>{job.description || 'No description available'}</Text>
            <Text style={styles.detailLabel}>Estimated Earnings</Text>
            <Text style={styles.detailValue}>${calculateEarnings(job)}</Text>
            {formResponses.length > 0 && (
              <>
                <Text style={styles.detailLabel}>Form Responses</Text>
                {formResponses.map((response, index) => (
                  <View key={index} style={styles.formResponseItem}>
                    <Text style={styles.formResponseLabel}>{response.form_name}:</Text>
                    {response.answers.map((answer, answerIndex) => (
                      <Text key={answerIndex} style={styles.formResponseValue}>{answer}</Text>
                    ))}
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {/* Activate Job Button - Only show for accepted jobs that aren't active yet */}
        {isAccepted && !isJobActive && !isClockedIn && !jobComplete && (
          <View style={styles.activateJobContainer}>
            <TouchableOpacity style={styles.activateJobButton} onPress={handleActivateJob}>
              <Text style={styles.activateJobText}>Activate Job</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Job Complete Status */}
        {jobComplete && (
          <View style={styles.jobCompleteContainer}>
            <Text style={styles.jobCompleteTitle}>Job Complete!</Text>
            <Text style={styles.jobCompleteTime}>Time Spent: {timeSpent}</Text>
            {clockInTime && clockOutTime && (
              <Text style={styles.jobCompleteDetails}>
                Clock In: {clockInTime.toLocaleTimeString()} | Clock Out: {clockOutTime.toLocaleTimeString()}
              </Text>
            )}
          </View>
        )}

        {/* Add bottom padding for floating button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      {!isAccepted ? (
        // Job not accepted - show swipe to accept
        <View style={styles.floatingButtonContainer}>
          <Animated.View
            {...acceptPanResponder.panHandlers}
            style={[
              styles.floatingSwipeAcceptButton,
              isAcceptingJob && styles.floatingSwipeAcceptButtonDisabled,
              {
                transform: [{ translateX }],
                backgroundColor: swipeProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['#3B82F6', '#10B981'],
                }),
              },
            ]}
          >
            <Animated.View style={styles.swipeContent}>
              <Text style={styles.floatingSwipeAcceptText}>
                {isAcceptingJob ? 'Accepting...' : (isSwiping ? 'Release to accept' : 'Swipe to accept')}
              </Text>
              <View style={styles.swipeArrows}>
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
              </View>
            </Animated.View>
            
            {/* Swipe progress indicator */}
            <Animated.View
              style={[
                styles.swipeProgressBar,
                {
                  width: swipeProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </Animated.View>
        </View>
      ) : isJobActive && !isClockedIn && !jobComplete ? (
        // Job active but not clocked in - show clock in button
        <View style={styles.floatingButtonContainer}>
          <Animated.View
            {...clockInPanResponder.panHandlers}
            style={[
              styles.floatingClockInButton,
              isClockingIn && styles.floatingSwipeAcceptButtonDisabled,
              {
                transform: [{ translateX }],
                backgroundColor: swipeProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['#10B981', '#059669'],
                }),
              },
            ]}
          >
            <Animated.View style={styles.swipeContent}>
              <Text style={styles.floatingClockInText}>
                {isClockingIn ? 'Clocking In...' : (isSwiping ? 'Release to clock in' : 'Swipe to clock in')}
              </Text>
              <View style={styles.swipeArrows}>
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
              </View>
            </Animated.View>
            
            {/* Swipe progress indicator */}
            <Animated.View
              style={[
                styles.swipeProgressBar,
                {
                  width: swipeProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </Animated.View>
        </View>
      ) : isClockedIn && !jobComplete ? (
        // Clocked in - show clock out button
        <View style={styles.floatingButtonContainer}>
          <Animated.View
            {...clockOutPanResponder.panHandlers}
            style={[
              styles.floatingClockOutButton,
              isClockingOut && styles.floatingSwipeAcceptButtonDisabled,
              {
                transform: [{ translateX }],
                backgroundColor: swipeProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['#EF4444', '#DC2626'],
                }),
              },
            ]}
          >
            <Animated.View style={styles.swipeContent}>
              <Text style={styles.floatingClockOutText}>
                {isClockingOut ? 'Clocking Out...' : (isSwiping ? 'Release to clock out' : 'Swipe to clock out')}
              </Text>
              <View style={styles.swipeArrows}>
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
              </View>
            </Animated.View>
            
            {/* Swipe progress indicator */}
            <Animated.View
              style={[
                styles.swipeProgressBar,
                {
                  width: swipeProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </Animated.View>
        </View>
      ) : (
        // Default state - show resources button
        <View style={styles.floatingButtonContainer}>
          <TouchableOpacity style={styles.floatingResourcesButton} onPress={handleResources}>
            <Text style={styles.floatingResourcesText}>Resources</Text>
          </TouchableOpacity>
        </View>
      )}
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
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    lineHeight: 32,
  },
  imageMapContainer: {
    height: 240,
    backgroundColor: '#F1F5F9',
    margin: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  imageMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageMapText: {
    fontSize: 18,
    color: '#64748B',
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  teamIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  detailsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 20,
  },
  additionalDetailsButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  additionalDetailsText: {
    fontSize: 18,
    color: '#1E293B',
    fontWeight: '600',
  },
  additionalDetailsContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  floatingSwipeAcceptButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  floatingSwipeAcceptButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  floatingSwipeAcceptText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  swipeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  swipeProgressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  floatingResourcesButton: {
    backgroundColor: '#10B981',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
  floatingResourcesText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  activateJobContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  activateJobButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activateJobText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  jobCompleteContainer: {
    backgroundColor: '#10B981',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  jobCompleteTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  jobCompleteTime: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  jobCompleteDetails: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  floatingClockInButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#10B981',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  floatingClockInText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  floatingClockOutButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  floatingClockOutText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  swipeAcceptButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  swipeAcceptText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  swipeArrows: {
    flexDirection: 'row',
    gap: 6,
  },
  resourcesButton: {
    backgroundColor: '#10B981',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
  resourcesText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  formResponseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  formResponseLabel: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  formResponseValue: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 20,
  },
})


