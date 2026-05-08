import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { authStore } from '@stores/authStore';
import { CustomTabBar } from '@components/CustomTabBar';

// Auth screens
import SplashScreen from '@screens/auth/SplashScreen';
import LoginScreen from '@screens/auth/LoginScreen';
import SignUpScreen from '@screens/auth/SignUpScreen';
import ForgotPasswordScreen from '@screens/auth/ForgotPasswordScreen';
import TwoFactorLoginScreen from '@screens/auth/TwoFactorLoginScreen';
import VerifyEmailScreen from '@screens/auth/VerifyEmailScreen';
import ProfileSelectionScreen from '@screens/auth/ProfileSelectionScreen';
import PersonalSetupScreen from '@screens/auth/PersonalSetupScreen';
import BusinessSetupScreen from '@screens/auth/BusinessSetupScreen';

// Tab screens
import HomeScreen from '@screens/main/HomeScreen';
import FeedSocialScreen from '@screens/main/FeedSocialScreen';
import ActivityScreen from '@screens/main/ActivityScreen';
import SettingsScreen from '@screens/main/SettingsScreen';

// Activity sub-screens
import ActivityFavoritesScreen from '@screens/main/ActivityFavoritesScreen';
import ActivityHistoryScreen from '@screens/main/ActivityHistoryScreen';

// Settings sub-screens
import SettingsMyAccountScreen from '@screens/main/SettingsMyAccountScreen';
import SettingsSecurityScreen from '@screens/main/SettingsSecurityScreen';
import SettingsPrivacyScreen from '@screens/main/SettingsPrivacyScreen';
import SettingsDeleteAccountScreen from '@screens/main/SettingsDeleteAccountScreen';
import SettingsCityScreen from '@screens/main/SettingsCityScreen';
import {
  Settings2FAScreen,
  SettingsAboutScreen,
  SettingsChangePasswordScreen,
} from '@screens/main/SettingsAuxScreens';

// Global / deep-link screens
import ProfileScreen from '@screens/main/ProfileScreen';
import ChatScreen from '@screens/main/ChatScreen';
import NotificationsScreen from '@screens/main/NotificationsScreen';
import CatalogScreen from '@screens/main/CatalogScreen';
import ItemScreen from '@screens/main/ItemScreen';
import ProductManagementScreen from '@screens/main/ProductManagementScreen';
import SearchScreen from '@screens/main/SearchScreen';
import MapScreen from '@screens/main/MapScreen';
import CreatePostScreen from '@screens/main/CreatePostScreen';
import PostDetailScreen from '@screens/main/PostDetailScreen';

const AuthStackNav = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ActivityStackNav = createNativeStackNavigator();
const SettingsStackNav = createNativeStackNavigator();
const MainStackNav = createNativeStackNavigator();

function AuthStack() {
  return (
    <AuthStackNav.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <AuthStackNav.Screen name="Splash" component={SplashScreen} />
      <AuthStackNav.Screen name="Login" component={LoginScreen} />
      <AuthStackNav.Screen name="TwoFactorLogin" component={TwoFactorLoginScreen} />
      <AuthStackNav.Screen name="SignUp" component={SignUpScreen} />
      <AuthStackNav.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStackNav.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <AuthStackNav.Screen name="ProfileSelection" component={ProfileSelectionScreen} />
      <AuthStackNav.Screen name="PersonalSetup" component={PersonalSetupScreen} />
      <AuthStackNav.Screen name="BusinessSetup" component={BusinessSetupScreen} />
    </AuthStackNav.Navigator>
  );
}

function ActivityStack() {
  return (
    <ActivityStackNav.Navigator screenOptions={{ headerShown: false }}>
      <ActivityStackNav.Screen name="ActivityMain" component={ActivityScreen} />
      <ActivityStackNav.Screen name="ActivityFavorites" component={ActivityFavoritesScreen} />
      <ActivityStackNav.Screen name="ActivityHistory" component={ActivityHistoryScreen} />
    </ActivityStackNav.Navigator>
  );
}

function SettingsStack() {
  return (
    <SettingsStackNav.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStackNav.Screen name="SettingsMain" component={SettingsScreen} />
      <SettingsStackNav.Screen name="SettingsMyAccount" component={SettingsMyAccountScreen} />
      <SettingsStackNav.Screen name="SettingsCity" component={SettingsCityScreen} />
      <SettingsStackNav.Screen name="SettingsPrivacy" component={SettingsPrivacyScreen} />
      <SettingsStackNav.Screen name="SettingsSecurity" component={SettingsSecurityScreen} />
      <SettingsStackNav.Screen name="SettingsChangePassword" component={SettingsChangePasswordScreen} />
      <SettingsStackNav.Screen name="Settings2FA" component={Settings2FAScreen} />
      <SettingsStackNav.Screen name="SettingsAbout" component={SettingsAboutScreen} />
      <SettingsStackNav.Screen name="SettingsDeleteAccount" component={SettingsDeleteAccountScreen} />
    </SettingsStackNav.Navigator>
  );
}

function MainTabs() {
  const postOnboardingTab = authStore((s) => s.postOnboardingTab);
  const clearPostOnboardingTarget = authStore((s) => s.clearPostOnboardingTarget);

  useEffect(() => {
    if (postOnboardingTab) {
      clearPostOnboardingTarget();
    }
  }, [clearPostOnboardingTarget, postOnboardingTab]);

  return (
    <Tab.Navigator
      initialRouteName={postOnboardingTab ?? 'Home'}
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Feed" component={FeedSocialScreen} />
      <Tab.Screen name="Activity" component={ActivityStack} />
      <Tab.Screen name="Settings" component={SettingsStack} />
    </Tab.Navigator>
  );
}

function MainAppStack() {
  return (
    <MainStackNav.Navigator screenOptions={{ headerShown: false }}>
      <MainStackNav.Screen name="MainTabs" component={MainTabs} />

      {/* Modal screens */}
      <MainStackNav.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{ presentation: 'modal' }}
      />

      {/* Global stack screens (reachable from any tab) */}
      <MainStackNav.Screen name="PostDetail" component={PostDetailScreen} />
      <MainStackNav.Screen name="Profile" component={ProfileScreen} />
      <MainStackNav.Screen name="Chat" component={ChatScreen} />
      <MainStackNav.Screen name="Notifications" component={NotificationsScreen} />
      <MainStackNav.Screen name="Search" component={SearchScreen} />
      <MainStackNav.Screen name="Map" component={MapScreen} />
      <MainStackNav.Screen name="Catalog" component={CatalogScreen} />
      <MainStackNav.Screen name="Item" component={ItemScreen} />
      <MainStackNav.Screen name="ProductManagement" component={ProductManagementScreen} />
    </MainStackNav.Navigator>
  );
}

export default function RootNavigator() {
  const { isAuthenticated, needsOnboarding } = authStore();
  return isAuthenticated && !needsOnboarding ? <MainAppStack /> : <AuthStack />;
}
