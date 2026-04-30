import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '@screens/auth/SplashScreen';
import OnboardingScreen from '@screens/auth/OnboardingScreen';
import LoginScreen from '@screens/auth/LoginScreen';
import SignUpScreen from '@screens/auth/SignUpScreen';
import ProfileSelectionScreen from '@screens/auth/ProfileSelectionScreen';
import PersonalSetupScreen from '@screens/auth/PersonalSetupScreen';
import BusinessSetupScreen from '@screens/auth/BusinessSetupScreen';

import HomeScreen from '@screens/main/HomeScreen';
import FeedSocialScreen from '@screens/main/FeedSocialScreen';
import SearchScreen from '@screens/main/SearchScreen';
import ActivityScreen from '@screens/main/ActivityScreen';
import ActivityFavoritesScreen from '@screens/main/ActivityFavoritesScreen';
import ActivityHistoryScreen from '@screens/main/ActivityHistoryScreen';
import MapScreen from '@screens/main/MapScreen';
import ChatScreen from '@screens/main/ChatScreen';
import ProfileScreen from '@screens/main/ProfileScreen';
import SettingsScreen from '@screens/main/SettingsScreen';
import SettingsMyAccountScreen from '@screens/main/SettingsMyAccountScreen';
import SettingsPrivacyScreen from '@screens/main/SettingsPrivacyScreen';
import SettingsSecurityScreen from '@screens/main/SettingsSecurityScreen';
import SettingsDeleteAccountScreen from '@screens/main/SettingsDeleteAccountScreen';
import SettingsCityScreen from '@screens/main/SettingsCityScreen';
import NotificationsScreen from '@screens/main/NotificationsScreen';
import CatalogScreen from '@screens/main/CatalogScreen';
import ItemScreen from '@screens/main/ItemScreen';
import {
  Settings2FAScreen,
  SettingsAboutScreen,
  SettingsAccessHistoryScreen,
  SettingsBlockedUsersScreen,
  SettingsChangePasswordScreen,
  SettingsDevicesScreen,
  SettingsLanguageScreen,
  SettingsLinkedAccountsScreen,
  SettingsNotificationsPrefsScreen,
  SettingsSearchRadiusScreen,
} from '@screens/main/SettingsAuxScreens';

const Stack = createNativeStackNavigator();

const PREVIEW_SCREENS = {
  Splash: SplashScreen,
  Onboarding: OnboardingScreen,
  Login: LoginScreen,
  SignUp: SignUpScreen,
  ProfileSelection: ProfileSelectionScreen,
  PersonalSetup: PersonalSetupScreen,
  BusinessSetup: BusinessSetupScreen,

  Home: HomeScreen,
  Feed: FeedSocialScreen,
  Search: SearchScreen,
  Activity: ActivityScreen,
  ActivityFavorites: ActivityFavoritesScreen,
  ActivityHistory: ActivityHistoryScreen,
  Map: MapScreen,
  Chat: ChatScreen,
  Profile: ProfileScreen,
  Notifications: NotificationsScreen,
  Catalog: CatalogScreen,
  Item: ItemScreen,

  Settings: SettingsScreen,
  SettingsMyAccount: SettingsMyAccountScreen,
  SettingsCity: SettingsCityScreen,
  SettingsLinkedAccounts: SettingsLinkedAccountsScreen,
  SettingsSearchRadius: SettingsSearchRadiusScreen,
  SettingsNotifications: SettingsNotificationsPrefsScreen,
  SettingsPrivacy: SettingsPrivacyScreen,
  SettingsBlockedUsers: SettingsBlockedUsersScreen,
  SettingsSecurity: SettingsSecurityScreen,
  SettingsChangePassword: SettingsChangePasswordScreen,
  Settings2FA: Settings2FAScreen,
  SettingsDevices: SettingsDevicesScreen,
  SettingsAccessHistory: SettingsAccessHistoryScreen,
  SettingsLanguage: SettingsLanguageScreen,
  SettingsAbout: SettingsAboutScreen,
  SettingsDeleteAccount: SettingsDeleteAccountScreen,
} as const;

type PreviewScreenName = keyof typeof PREVIEW_SCREENS;

export const PREVIEW_SCREEN_NAMES = Object.keys(PREVIEW_SCREENS) as PreviewScreenName[];

const isPreviewScreenName = (value: string | null): value is PreviewScreenName =>
  value !== null && PREVIEW_SCREEN_NAMES.includes(value as PreviewScreenName);

const openPreviewInNewTab = (screenName: PreviewScreenName) => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return;
  }

  const url = `${window.location.origin}/?preview=${encodeURIComponent(screenName)}`;
  window.open(url, '_blank');
};

function PreviewIndexScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Preview de Telas</Text>
        <Text style={styles.subtitle}>
          Clique em uma tela para abrir em nova aba.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {PREVIEW_SCREEN_NAMES.map((screenName) => (
          <TouchableOpacity
            key={screenName}
            style={styles.item}
            onPress={() => openPreviewInNewTab(screenName)}
          >
            <Text style={styles.itemText}>{screenName}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export function WebPreviewNavigator({
  previewScreenName,
}: {
  previewScreenName: string | null;
}) {
  const initialRoute = isPreviewScreenName(previewScreenName)
    ? previewScreenName
    : 'PreviewIndex';

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="PreviewIndex" component={PreviewIndexScreen} />
      {PREVIEW_SCREEN_NAMES.map((screenName) => (
        <Stack.Screen
          key={screenName}
          name={screenName}
          component={PREVIEW_SCREENS[screenName]}
        />
      ))}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  header: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: '#B5B5B5',
    fontSize: 14,
    marginTop: 6,
  },
  content: {
    padding: 16,
    gap: 10,
  },
  item: {
    borderWidth: 1,
    borderColor: '#2B2B2B',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#171717',
  },
  itemText: {
    color: '#E8640A',
    fontSize: 14,
    fontWeight: '700',
  },
});
