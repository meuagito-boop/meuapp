import React from 'react';
import { Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { authStore } from '@stores/authStore';

// Screens - Auth
import SplashScreen from '@screens/auth/SplashScreen';
import LoginScreen from '@screens/auth/LoginScreen';
import SignUpScreen from '@screens/auth/SignUpScreen';
import ProfileSelectionScreen from '@screens/auth/ProfileSelectionScreen';

// Screens - Main
import HomeScreen from '@screens/main/HomeScreen';
import SearchScreen from '@screens/main/SearchScreen';
import MapScreen from '@screens/main/MapScreen';
import ChatScreen from '@screens/main/ChatScreen';
import ProfileScreen from '@screens/main/ProfileScreen';
import FeedSocialScreen from '@screens/main/FeedSocialScreen';
import ActivityScreen from '@screens/main/ActivityScreen';
import ActivityFavoritesScreen from '@screens/main/ActivityFavoritesScreen';
import ActivityHistoryScreen from '@screens/main/ActivityHistoryScreen';
import SettingsScreen from '@screens/main/SettingsScreen';
import SettingsMyAccountScreen from '@screens/main/SettingsMyAccountScreen';
import SettingsPrivacyScreen from '@screens/main/SettingsPrivacyScreen';
import SettingsSecurityScreen from '@screens/main/SettingsSecurityScreen';
import SettingsDeleteAccountScreen from '@screens/main/SettingsDeleteAccountScreen';
import NotificationsScreen from '@screens/main/NotificationsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ProfileSelection" component={ProfileSelectionScreen} />
    </Stack.Navigator>
  );
}

// Activity Stack (for nested screens)
function ActivityStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="ActivityMain" component={ActivityScreen} />
      <Stack.Screen name="ActivityFavorites" component={ActivityFavoritesScreen} />
      <Stack.Screen name="ActivityHistory" component={ActivityHistoryScreen} />
    </Stack.Navigator>
  );
}

// Settings Stack (for nested screens)
function SettingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="SettingsMyAccount" component={SettingsMyAccountScreen} />
      <Stack.Screen name="SettingsPrivacy" component={SettingsPrivacyScreen} />
      <Stack.Screen name="SettingsSecurity" component={SettingsSecurityScreen} />
      <Stack.Screen name="SettingsDeleteAccount" component={SettingsDeleteAccountScreen} />
    </Stack.Navigator>
  );
}

// Main Tab Stack
function MainTabStack() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#E8640A',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#0D0D0D',
          borderTopWidth: 1,
          borderTopColor: '#1A1A1A',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Feed"
        component={FeedSocialScreen}
        options={{
          tabBarLabel: 'Feed',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🌪️</Text>,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Buscar',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🔍</Text>,
        }}
      />
      <Tab.Screen
        name="Activity"
        component={ActivityStack}
        options={{
          tabBarLabel: 'Atividade',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📋</Text>,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Activity', { screen: 'ActivityMain' });
          },
        })}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: 'Mapa',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🗺️</Text>,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>💬</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text>,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{
          tabBarLabel: 'Config',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚙️</Text>,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Settings', { screen: 'SettingsMain' });
          },
        })}
      />
    </Tab.Navigator>
  );
}

// Root Navigator
export default function RootNavigator() {
  const { isAuthenticated } = authStore();

  return isAuthenticated ? <MainTabStack /> : <AuthStack />;
}
