import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const mockProfile = {
  name: 'John Smith',
  location: 'New York, NY',
  title: 'Senior Cleaner',
  hourlyPay: '$25/hr',
  jobsCompleted: 156,
  points: 1250,
  stats: {
    totalHours: 1240,
    totalEarnings: 31250,
    averageRating: 4.8,
  },
}

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'history' | 'payments' | 'stats'>('history')

  const TabButton = ({ 
    title, 
    tab, 
    icon 
  }: { 
    title: string
    tab: 'history' | 'payments' | 'stats'
    icon: keyof typeof Ionicons.glyphMap
  }) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons 
        name={icon} 
        size={20} 
        color={activeTab === tab ? '#3B82F6' : '#64748B'} 
      />
      <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'history':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Job History</Text>
            <View style={styles.jobHistoryItem}>
              <View style={styles.jobHistoryHeader}>
                <Text style={styles.jobHistoryTitle}>House Cleaning</Text>
                <Text style={styles.jobHistoryDate}>Jan 15, 2024</Text>
              </View>
              <Text style={styles.jobHistoryDescription}>Deep cleaning service for 3-bedroom house</Text>
              <View style={styles.jobHistoryFooter}>
                <Text style={styles.jobHistoryEarnings}>$75.00</Text>
                <Text style={styles.jobHistoryDuration}>3 hours</Text>
              </View>
            </View>
            <View style={styles.jobHistoryItem}>
              <View style={styles.jobHistoryHeader}>
                <Text style={styles.jobHistoryTitle}>Office Maintenance</Text>
                <Text style={styles.jobHistoryDate}>Jan 14, 2024</Text>
              </View>
              <Text style={styles.jobHistoryDescription}>Regular maintenance and cleaning</Text>
              <View style={styles.jobHistoryFooter}>
                <Text style={styles.jobHistoryEarnings}>$50.00</Text>
                <Text style={styles.jobHistoryDuration}>2 hours</Text>
              </View>
            </View>
          </View>
        )
      case 'payments':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Payment History</Text>
            <View style={styles.paymentItem}>
              <View style={styles.paymentHeader}>
                <Text style={styles.paymentTitle}>Weekly Payment</Text>
                <Text style={styles.paymentDate}>Jan 15, 2024</Text>
              </View>
              <Text style={styles.paymentAmount}>$325.00</Text>
              <Text style={styles.paymentStatus}>Completed</Text>
            </View>
            <View style={styles.paymentItem}>
              <View style={styles.paymentHeader}>
                <Text style={styles.paymentTitle}>Weekly Payment</Text>
                <Text style={styles.paymentDate}>Jan 8, 2024</Text>
              </View>
              <Text style={styles.paymentAmount}>$280.00</Text>
              <Text style={styles.paymentStatus}>Completed</Text>
            </View>
          </View>
        )
      case 'stats':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="time-outline" size={24} color="#3B82F6" />
                <Text style={styles.statValue}>{mockProfile.stats.totalHours}</Text>
                <Text style={styles.statLabel}>Total Hours</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="cash-outline" size={24} color="#10B981" />
                <Text style={styles.statValue}>${mockProfile.stats.totalEarnings.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Total Earnings</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="star" size={24} color="#F59E0B" />
                <Text style={styles.statValue}>{mockProfile.stats.averageRating}</Text>
                <Text style={styles.statLabel}>Average Rating</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="trophy-outline" size={24} color="#8B5CF6" />
                <Text style={styles.statValue}>{mockProfile.points}</Text>
                <Text style={styles.statLabel}>Total Points</Text>
              </View>
            </View>
          </View>
        )
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#1E293B" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              <Ionicons name="person" size={48} color="#FFFFFF" />
            </View>
          </View>
          
          <Text style={styles.profileName}>{mockProfile.name}</Text>
          <Text style={styles.profileLocation}>{mockProfile.location}</Text>
          
          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{mockProfile.title}</Text>
              <Text style={styles.profileStatLabel}>Title</Text>
            </View>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{mockProfile.hourlyPay}</Text>
              <Text style={styles.profileStatLabel}>Hourly Pay</Text>
            </View>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{mockProfile.jobsCompleted}</Text>
              <Text style={styles.profileStatLabel}>Jobs Completed</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TabButton title="Job History" tab="history" icon="time-outline" />
          <TabButton title="Payments" tab="payments" icon="card-outline" />
          <TabButton title="Stats" tab="stats" icon="analytics-outline" />
        </View>

        {/* Tab Content */}
        {renderTabContent()}

        {/* General Information */}
        <View style={styles.generalInfoSection}>
          <Text style={styles.sectionTitle}>General Information</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>First Name</Text>
            <Text style={styles.infoValue}>John</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Last Name</Text>
            <Text style={styles.infoValue}>Smith</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>(555) 123-4567</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>john.smith@email.com</Text>
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
  editButton: {
    padding: 4,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  profileLocation: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 20,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  profileStat: {
    alignItems: 'center',
  },
  profileStatValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  profileStatLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#3B82F6',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginLeft: 8,
  },
  activeTabButtonText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  tabContent: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  jobHistoryItem: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  jobHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobHistoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  jobHistoryDate: {
    fontSize: 14,
    color: '#64748B',
  },
  jobHistoryDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  jobHistoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobHistoryEarnings: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  jobHistoryDuration: {
    fontSize: 14,
    color: '#64748B',
  },
  paymentItem: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  paymentDate: {
    fontSize: 14,
    color: '#64748B',
  },
  paymentAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  paymentStatus: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  generalInfoSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
})

