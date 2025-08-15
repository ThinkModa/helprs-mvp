import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Job } from '../types/database'

// Mock data
const mockJobs: Job[] = [
  {
    id: 'job_1',
    company_id: 'company_1',
    customer_id: 'customer_1',
    calendar_id: 'calendar_1',
    appointment_type_id: 'appt_1',
    title: 'House Cleaning',
    description: 'Deep cleaning service for 3-bedroom house',
    status: 'scheduled',
    scheduled_date: '2024-01-15',
    scheduled_time: '09:00',
    estimated_duration: 180,
    base_price: 150.00,
    minimum_price: 120.00,
    location_address: '123 Main St, City, State',
    location_coordinates: null,
    form_id: null,
    created_by: null,
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
  },
  {
    id: 'job_2',
    company_id: 'company_1',
    customer_id: 'customer_2',
    calendar_id: 'calendar_1',
    appointment_type_id: 'appt_2',
    title: 'Office Maintenance',
    description: 'Regular maintenance and cleaning',
    status: 'open',
    scheduled_date: '2024-01-16',
    scheduled_time: '14:00',
    estimated_duration: 120,
    base_price: 200.00,
    minimum_price: 180.00,
    location_address: '456 Business Ave, City, State',
    location_coordinates: null,
    form_id: null,
    created_by: null,
    created_at: '2024-01-10T11:00:00Z',
    updated_at: '2024-01-10T11:00:00Z',
  },
]

const weekDays = [
  { day: 'Mon', date: '15', active: true },
  { day: 'Tue', date: '16', active: false },
  { day: 'Wed', date: '17', active: false },
  { day: 'Thu', date: '18', active: false },
  { day: 'Fri', date: '19', active: false },
  { day: 'Sat', date: '20', active: false },
  { day: 'Sun', date: '21', active: false },
]

export default function ScheduleScreen() {
  const [activeTab, setActiveTab] = useState<'available' | 'my' | 'all'>('available')
  const [selectedDate, setSelectedDate] = useState('15')

  const calculateEarnings = (job: Job) => {
    const hours = (job.estimated_duration || 0) / 60
    const hourlyRate = 25
    return (hours * hourlyRate).toFixed(2)
  }

  const formatTime = (time: string) => {
    return time.substring(0, 5)
  }

  const JobCard = ({ job }: { job: Job }) => (
    <TouchableOpacity style={styles.jobCard}>
      <View style={styles.jobImageContainer}>
        <View style={styles.jobImage}>
          <Ionicons name="location" size={24} color="#64748B" />
        </View>
      </View>
      
      <View style={styles.jobContent}>
        <View style={styles.jobHeader}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.earningsText}>${calculateEarnings(job)}</Text>
        </View>
        
        <Text style={styles.jobDescription}>{job.description}</Text>
        
        <View style={styles.jobDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#64748B" />
            <Text style={styles.detailText}>
              {formatTime(job.scheduled_time || '')} - {formatTime(job.scheduled_time || '')}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#64748B" />
            <Text style={styles.detailText}>{job.location_address}</Text>
          </View>
        </View>
        
        <View style={styles.workerIcons}>
          <View style={styles.workerIcon}>
            <Ionicons name="person" size={16} color="#FFFFFF" />
          </View>
          <View style={styles.workerIcon}>
            <Ionicons name="person" size={16} color="#FFFFFF" />
          </View>
          <View style={styles.workerIcon}>
            <Ionicons name="person" size={16} color="#FFFFFF" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Jobs</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.activeTab]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
            Available Jobs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my' && styles.activeTab]}
          onPress={() => setActiveTab('my')}
        >
          <Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>
            My Jobs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All Jobs
          </Text>
        </TouchableOpacity>
      </View>

      {/* Calendar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.calendarContainer}>
        {weekDays.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.calendarDay, day.active && styles.activeCalendarDay]}
            onPress={() => setSelectedDate(day.date)}
          >
            <Text style={[styles.calendarDayText, day.active && styles.activeCalendarDayText]}>
              {day.day}
            </Text>
            <Text style={[styles.calendarDateText, day.active && styles.activeCalendarDateText]}>
              {day.date}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Jobs List */}
      <ScrollView style={styles.jobsList} showsVerticalScrollIndicator={false}>
        {mockJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  searchButton: {
    padding: 4,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  calendarContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  calendarDay: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  activeCalendarDay: {
    backgroundColor: '#3B82F6',
  },
  calendarDayText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  activeCalendarDayText: {
    color: '#FFFFFF',
  },
  calendarDateText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
  },
  activeCalendarDateText: {
    color: '#FFFFFF',
  },
  jobsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  jobCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  jobImageContainer: {
    marginRight: 16,
  },
  jobImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobContent: {
    flex: 1,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  earningsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  jobDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
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
  workerIcons: {
    flexDirection: 'row',
  },
  workerIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
})

