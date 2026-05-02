import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { authStore } from '@stores/authStore';

import SplashScreen from '@screens/auth/SplashScreen';
import OnboardingScreen from '@screens/auth/OnboardingScreen';
import LoginScreen from '@screens/auth/LoginScreen';
import SignUpScreen from '@screens/auth/SignUpScreen';
import ForgotPasswordScreen from '@screens/auth/ForgotPasswordScreen';
import TwoFactorLoginScreen from '@screens/auth/TwoFactorLoginScreen';
import VerifyEmailScreen from '@screens/auth/VerifyEmailScreen';
import ProfileSelectionScreen from '@screens/auth/ProfileSelectionScreen';
import PersonalSetupScreen from '@screens/auth/PersonalSetupScreen';
import BusinessSetupScreen from '@screens/auth/BusinessSetupScreen';

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
import SettingsSecurityScreen from '@screens/main/SettingsSecurityScreen';
import SettingsDeleteAccountScreen from '@screens/main/SettingsDeleteAccountScreen';
import SettingsCityScreen from '@screens/main/SettingsCityScreen';
import NotificationsScreen from '@screens/main/NotificationsScreen';
import CatalogScreen from '@screens/main/CatalogScreen';
import ItemScreen from '@screens/main/ItemScreen';
import {
  Settings2FAScreen,
  SettingsAboutScreen,
  SettingsChangePasswordScreen,
} from '@screens/main/SettingsAuxScreens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const MainStack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="TwoFactorLogin" component={TwoFactorLoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <Stack.Screen name="ProfileSelection" component={ProfileSelectionScreen} />
      <Stack.Screen name="PersonalSetup" component={PersonalSetupScreen} />
      <Stack.Screen name="BusinessSetup" component={BusinessSetupScreen} />
    </Stack.Navigator>
  );
}

function ActivityStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ActivityMain" component={ActivityScreen} />
      <Stack.Screen name="ActivityFavorites" component={ActivityFavoritesScreen} />
      <Stack.Screen name="ActivityHistory" component={ActivityHistoryScreen} />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="SettingsMyAccount" component={SettingsMyAccountScreen} />
      <Stack.Screen name="SettingsCity" component={SettingsCityScreen} />
      <Stack.Screen name="SettingsSecurity" component={SettingsSecurityScreen} />
      <Stack.Screen name="SettingsChangePassword" component={SettingsChangePasswordScreen} />
      <Stack.Screen name="Settings2FA" component={Settings2FAScreen} />
      <Stack.Screen name="SettingsAbout" component={SettingsAboutScreen} />
      <Stack.Screen name="SettingsDeleteAccount" component={SettingsDeleteAccountScreen} />
    </Stack.Navigator>
  );
}

function MainTabStack() {
  const postOnboardingTab = authStore((state) => state.postOnboardingTab);
  const postOnboardingProfileParams = authStore((state) => state.postOnboardingProfileParams);
  const clearPostOnboardingTarget = authStore((state) => state.clearPostOnboardingTarget);

  useEffect(() => {
    if (postOnboardingTab) {
      clearPostOnboardingTarget();
    }
  }, [clearPostOnboardingTarget, postOnboardingTab]);

  return (
    <Tab.Navigator
      initialRouteName={postOnboardingTab ?? 'Home'}
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
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>H</Text>,
        }}
      />
      <Tab.Screen
        name="Feed"
        component={FeedSocialScreen}
        options={{
          tabBarLabel: 'Feed',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>F</Text>,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Buscar',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>S</Text>,
        }}
      />
      <Tab.Screen
        name="Activity"
        component={ActivityStack}
        options={{
          tabBarLabel: 'Atividade',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>A</Text>,
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
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>M</Text>,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>C</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        initialParams={postOnboardingProfileParams ?? undefined}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>P</Text>,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{
          tabBarLabel: 'Config',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>G</Text>,
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

function MainAppStack() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="MainTabs" component={MainTabStack} />
      <MainStack.Screen name="Notifications" component={NotificationsScreen} />
      <MainStack.Screen name="Catalog" component={CatalogScreen} />
      <MainStack.Screen name="Item" component={ItemScreen} />
    </MainStack.Navigator>
  );
}

export default function RootNavigator() {
  const { isAuthenticated, needsOnboarding } = authStore();
  return isAuthenticated && !needsOnboarding ? <MainAppStack /> : <AuthStack />;
}
