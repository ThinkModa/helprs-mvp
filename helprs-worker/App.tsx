import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { View, Text, StyleSheet } from 'react-native'

// Screens
import HomeScreen from './src/screens/HomeScreen'
import JobsScreen from './src/screens/JobsScreen'
import JobDetailsScreen from './src/screens/JobDetailsScreen'
import ProfileScreen from './src/screens/ProfileScreen'
import LoginScreen from './src/screens/LoginScreen'

// Supabase
import { testSupabaseConnection } from './src/lib/supabase'

// Types
import { Job } from './src/services/api'

export type RootStackParamList = {
  Login: undefined
  Main: undefined
  JobDetails: { job: Job; isAccepted?: boolean }
}

export type MainTabParamList = {
  Home: undefined
  Jobs: undefined
  Profile: undefined
}

const Stack = createStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<MainTabParamList>()

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline'
          } else if (route.name === 'Jobs') {
            iconName = focused ? 'briefcase' : 'briefcase-outline'
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline'
          } else {
            iconName = 'help-outline'
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Jobs" 
        component={JobsScreen}
        options={{ title: 'Jobs' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  )
}

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Connecting to database...</Text>
    </View>
  )
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<string>('Connecting...')
  
  // For testing - bypass authentication
  const isAuthenticated = true

  useEffect(() => {
    const testConnection = async () => {
      try {
        setConnectionStatus('Testing database connection...')
        const isConnected = await testSupabaseConnection()
        
        if (isConnected) {
          setConnectionStatus('Connected successfully!')
          console.log('✅ Database connection successful')
        } else {
          setConnectionStatus('Connection failed')
          console.error('❌ Database connection failed')
        }
      } catch (error) {
        setConnectionStatus('Connection error')
        console.error('❌ Database connection error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    testConnection()
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen 
              name="JobDetails" 
              component={JobDetailsScreen}
              options={{ 
                headerShown: true,
                title: 'Job Details',
                headerBackTitle: 'Back'
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
  },
})
