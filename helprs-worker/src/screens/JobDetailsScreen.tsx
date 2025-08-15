import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Job } from '../types/database'

interface JobDetailsScreenProps {
  route: {
    params: {
      job: Job
    }
  }
}

export default function JobDetailsScreen({ route }: JobDetailsScreenProps) {
  const { job } = route.params
  const [isAccepted, setIsAccepted] = useState(false)
  const [showCustomerInfo, setShowCustomerInfo] = useState(false)

  const calculateEarnings = (job: Job) => {
    const hours = (job.estimated_duration || 0) / 60
    const hourlyRate = 25
    return (hours * hourlyRate).toFixed(2)
  }

  const formatTime = (time: string) => {
    return time.substring(0, 5)
  }

  const handleAcceptJob = () => {
    setIsAccepted(true)
    setShowCustomerInfo(true)
  }

  const handleClockIn = () => {
    // TODO: Implement clock in functionality
    console.log('Clock in pressed')
  }

  const handleClockOut = () => {
    // TODO: Implement clock out functionality
    console.log('Clock out pressed')
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Map Section */}
        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={48} color="#64748B" />
            <Text style={styles.mapText}>Map View</Text>
            <Text style={styles.mapSubtext}>{job.location_address}</Text>
          </View>
        </View>

        {/* Job Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.jobHeader}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <View style={styles.jobCategory}>
              <Text style={styles.categoryText}>Generic</Text>
            </View>
          </View>

          <Text style={styles.jobDescription}>{job.description}</Text>

          {/* Job Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={20} color="#64748B" />
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Duration</Text>
                <Text style={styles.statValue}>{job.estimated_duration} min</Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="cash-outline" size={20} color="#64748B" />
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Earnings</Text>
                <Text style={styles.statValue}>${calculateEarnings(job)}</Text>
              </View>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Job Details</Text>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Special Instructions</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter any special instructions..."
                multiline
                numberOfLines={3}
              />
            </View>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Notes</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Add notes about the job..."
                multiline
                numberOfLines={2}
              />
            </View>
          </View>

          {/* Workers Section */}
          <View style={styles.workersSection}>
            <Text style={styles.sectionTitle}>Team Members</Text>
            <View style={styles.workersList}>
              <View style={styles.workerItem}>
                <View style={styles.workerAvatar}>
                  <Ionicons name="person" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.workerInfo}>
                  <Text style={styles.workerName}>John Smith</Text>
                  <Text style={styles.workerRole}>Lead Worker</Text>
                </View>
                <TouchableOpacity style={styles.chatButton}>
                  <Ionicons name="chatbubble-outline" size={20} color="#3B82F6" />
                </TouchableOpacity>
              </View>
              <View style={styles.workerItem}>
                <View style={styles.workerAvatar}>
                  <Ionicons name="person" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.workerInfo}>
                  <Text style={styles.workerName}>Sarah Johnson</Text>
                  <Text style={styles.workerRole}>Worker</Text>
                </View>
                <TouchableOpacity style={styles.chatButton}>
                  <Ionicons name="chatbubble-outline" size={20} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Customer Info (shown after accepting) */}
          {showCustomerInfo && (
            <View style={styles.customerSection}>
              <Text style={styles.sectionTitle}>Customer Information</Text>
              <View style={styles.customerInfo}>
                <View style={styles.customerRow}>
                  <Ionicons name="person-outline" size={16} color="#64748B" />
                  <Text style={styles.customerText}>John Doe</Text>
                </View>
                <View style={styles.customerRow}>
                  <Ionicons name="location-outline" size={16} color="#64748B" />
                  <Text style={styles.customerText}>{job.location_address}</Text>
                </View>
                <View style={styles.customerRow}>
                  <Ionicons name="call-outline" size={16} color="#64748B" />
                  <Text style={styles.customerText}>(555) 123-4567</Text>
                </View>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {!isAccepted ? (
              <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptJob}>
                <Text style={styles.acceptButtonText}>Accept Job</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.clockButtons}>
                <TouchableOpacity style={styles.clockInButton} onPress={handleClockIn}>
                  <Ionicons name="play" size={20} color="#FFFFFF" />
                  <Text style={styles.clockButtonText}>Clock In</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.clockOutButton} onPress={handleClockOut}>
                  <Ionicons name="stop" size={20} color="#FFFFFF" />
                  <Text style={styles.clockButtonText}>Clock Out</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Total Earnings */}
          <View style={styles.earningsContainer}>
            <Text style={styles.earningsLabel}>Total Earning Potential</Text>
            <Text style={styles.earningsAmount}>${calculateEarnings(job)}</Text>
          </View>
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
  },
  mapContainer: {
    height: 200,
    backgroundColor: '#F1F5F9',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 8,
  },
  mapSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  detailsContainer: {
    padding: 16,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    flex: 1,
  },
  jobCategory: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  jobDescription: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  statContent: {
    marginLeft: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    minHeight: 40,
  },
  workersSection: {
    marginBottom: 24,
  },
  workersList: {
    gap: 12,
  },
  workerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  workerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  workerRole: {
    fontSize: 14,
    color: '#64748B',
  },
  chatButton: {
    padding: 8,
  },
  customerSection: {
    marginBottom: 24,
  },
  customerInfo: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 8,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerText: {
    fontSize: 16,
    color: '#1E293B',
    marginLeft: 12,
  },
  actionButtons: {
    marginBottom: 24,
  },
  acceptButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  clockButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  clockInButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockOutButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  earningsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  earningsLabel: {
    fontSize: 16,
    color: '#64748B',
  },
  earningsAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
})

