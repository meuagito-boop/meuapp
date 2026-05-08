/**
 * WebPreviewNavigator — Dev-only screen browser for Expo Web and native Expo.
 *
 * Usage:
 *   EXPO_PUBLIC_UI_PREVIEW_MODE=true npx expo start
 *   http://localhost:8081/?preview=Login  -> abre LoginScreen direto no web
 *
 * Cada card da lista abre a tela no mesmo tab com um botão "← Telas" para voltar.
 * Para abrir em nova aba, use o botão ↗ ao lado do nome.
 */
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
import { Feather } from '@expo/vector-icons';
import { useNavigation, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authStore } from '@stores/authStore';
import { previewUserAuth } from '@dev/previewData';

// Auth
import SplashScreen from '@screens/auth/SplashScreen';
import LoginScreen from '@screens/auth/LoginScreen';
import SignUpScreen from '@screens/auth/SignUpScreen';
import ForgotPasswordScreen from '@screens/auth/ForgotPasswordScreen';
import VerifyEmailScreen from '@screens/auth/VerifyEmailScreen';
import TwoFactorLoginScreen from '@screens/auth/TwoFactorLoginScreen';
import ProfileSelectionScreen from '@screens/auth/ProfileSelectionScreen';
import PersonalSetupScreen from '@screens/auth/PersonalSetupScreen';
import BusinessSetupScreen from '@screens/auth/BusinessSetupScreen';

// Main
import HomeScreen from '@screens/main/HomeScreen';
import FeedSocialScreen from '@screens/main/FeedSocialScreen';
import SearchScreen from '@screens/main/SearchScreen';
import ActivityScreen from '@screens/main/ActivityScreen';
import ActivityFavoritesScreen from '@screens/main/ActivityFavoritesScreen';
import ActivityHistoryScreen from '@screens/main/ActivityHistoryScreen';
import MapScreen from '@screens/main/MapScreen';
import ChatScreen from '@screens/main/ChatScreen';
import ProfileScreen from '@screens/main/ProfileScreen';
import NotificationsScreen from '@screens/main/NotificationsScreen';
import CatalogScreen from '@screens/main/CatalogScreen';
import ItemScreen from '@screens/main/ItemScreen';
import CreatePostScreen from '@screens/main/CreatePostScreen';
import PostDetailScreen from '@screens/main/PostDetailScreen';
import ProductManagementScreen from '@screens/main/ProductManagementScreen';

// Settings
import SettingsScreen from '@screens/main/SettingsScreen';
import SettingsMyAccountScreen from '@screens/main/SettingsMyAccountScreen';
import SettingsPrivacyScreen from '@screens/main/SettingsPrivacyScreen';
import SettingsSecurityScreen from '@screens/main/SettingsSecurityScreen';
import SettingsDeleteAccountScreen from '@screens/main/SettingsDeleteAccountScreen';
import SettingsCityScreen from '@screens/main/SettingsCityScreen';
import {
  Settings2FAScreen,
  SettingsAboutScreen,
  SettingsChangePasswordScreen,
} from '@screens/main/SettingsAuxScreens';

// ─────────────────────────────────────────────────────────
// Registry com categorias
// ─────────────────────────────────────────────────────────

type ScreenEntry = {
  name: string;
  title: string;
  description?: string;
  component: React.ComponentType<object>;
  initialParams?: Record<string, unknown>;
};

type ScreenCategory = {
  label: string;
  color: string;
  screens: ScreenEntry[];
};

const CATEGORIES: ScreenCategory[] = [
  {
    label: '01 Acesso e cadastro',
    color: '#FF6600',
    screens: [
      { name: 'Splash', title: 'Splash', description: 'Entrada do app', component: SplashScreen },
      { name: 'Login', title: 'Login', description: 'Entrar na conta', component: LoginScreen },
      {
        name: 'ProfileSelection',
        title: 'Cadastro: tipo de conta',
        description: 'Rota chamada pelo Login ao criar conta',
        component: ProfileSelectionScreen,
      },
      {
        name: 'SignUp',
        title: 'Cadastro: dados da conta',
        description: 'Rota chamada depois da escolha de perfil',
        component: SignUpScreen,
        initialParams: { profileType: 'USER' },
      },
      {
        name: 'PersonalSetup',
        title: 'Setup pessoal',
        description: 'Proxima rota apos cadastro pessoal',
        component: PersonalSetupScreen,
      },
      {
        name: 'BusinessSetup',
        title: 'Setup empresarial',
        description: 'Proxima rota apos cadastro empresarial',
        component: BusinessSetupScreen,
      },
    ],
  },
  {
    label: '02 Acesso auxiliar',
    color: '#8B5CF6',
    screens: [
      {
        name: 'TwoFactorLogin',
        title: 'Login 2FA',
        description: 'Rota alternativa apos login com 2FA',
        component: TwoFactorLoginScreen,
      },
      {
        name: 'ForgotPassword',
        title: 'Recuperar senha',
        description: 'Rota chamada por Esqueci minha senha',
        component: ForgotPasswordScreen,
      },
      {
        name: 'VerifyEmail',
        title: 'Verificar e-mail',
        description: 'Rota chamada por reenviar/verificar e-mail',
        component: VerifyEmailScreen,
        initialParams: { email: 'preview@meuagito.local' },
      },
    ],
  },
  {
    label: '03 Tabs principais',
    color: '#22C55E',
    screens: [
      { name: 'Home', title: 'Home', description: 'Tab inicial', component: HomeScreen },
      { name: 'Feed', title: 'Feed social', description: 'Tab social', component: FeedSocialScreen },
      {
        name: 'Activity',
        title: 'Atividades',
        description: 'Tab real Activity',
        component: ActivityScreen,
      },
      {
        name: 'Settings',
        title: 'Configurações',
        description: 'Tab real Settings',
        component: SettingsScreen,
      },
    ],
  },
  {
    label: '04 Atividade',
    color: '#3B82F6',
    screens: [
      {
        name: 'ActivityFavorites',
        title: 'Favoritos',
        description: 'Subtela da pilha Activity',
        component: ActivityFavoritesScreen,
      },
      {
        name: 'ActivityHistory',
        title: 'Histórico',
        description: 'Subtela da pilha Activity',
        component: ActivityHistoryScreen,
      },
    ],
  },
  {
    label: '05 Descoberta e conteúdo',
    color: '#F59E0B',
    screens: [
      { name: 'Search', title: 'Busca', description: 'Rota global Search', component: SearchScreen },
      { name: 'Map', title: 'Mapa', description: 'Rota global Map', component: MapScreen },
      {
        name: 'Catalog',
        title: 'Catálogo',
        description: 'Rota global Catalog',
        component: CatalogScreen,
        initialParams: {
          establishmentId: 'preview-est-1',
          establishmentName: 'Boteco Avenida',
          template: 'produto',
        },
      },
      {
        name: 'Item',
        title: 'Item',
        description: 'Rota global Item',
        component: ItemScreen,
        initialParams: {
          template: 'produto',
          productId: 'preview-product-1',
          establishmentId: 'preview-est-1',
          establishmentName: 'Boteco Avenida',
        },
      },
    ],
  },
  {
    label: '06 Social e comunicação',
    color: '#EF4444',
    screens: [
      { name: 'CreatePost', title: 'Criar post', description: 'Modal global CreatePost', component: CreatePostScreen },
      {
        name: 'PostDetail',
        title: 'Detalhe do post',
        description: 'Rota global PostDetail',
        component: PostDetailScreen,
        initialParams: { postId: 'preview-post-1' },
      },
      { name: 'Profile', title: 'Perfil', description: 'Rota global Profile', component: ProfileScreen, initialParams: { userId: 'preview-user-1' } },
      { name: 'Chat', title: 'Chat', description: 'Rota global Chat', component: ChatScreen },
      { name: 'Notifications', title: 'Notificações', description: 'Rota global Notifications', component: NotificationsScreen },
      {
        name: 'ProductManagement',
        title: 'Gerenciar produtos',
        description: 'Rota global ProductManagement',
        component: ProductManagementScreen,
        initialParams: {
          establishmentId: 'preview-est-1',
          establishmentName: 'Boteco Avenida',
        },
      },
    ],
  },
  {
    label: '07 Configurações',
    color: '#6B7280',
    screens: [
      { name: 'SettingsMyAccount', title: 'Minha conta', description: 'Subtela Settings', component: SettingsMyAccountScreen },
      { name: 'SettingsCity', title: 'Cidade', description: 'Subtela Settings', component: SettingsCityScreen },
      { name: 'SettingsPrivacy', title: 'Privacidade', description: 'Subtela Settings', component: SettingsPrivacyScreen },
      { name: 'SettingsSecurity', title: 'Segurança', description: 'Subtela Settings', component: SettingsSecurityScreen },
      {
        name: 'SettingsChangePassword',
        title: 'Alterar senha',
        description: 'Subtela Settings',
        component: SettingsChangePasswordScreen,
      },
      { name: 'Settings2FA', title: 'Autenticação 2FA', description: 'Subtela Settings', component: Settings2FAScreen },
      { name: 'SettingsAbout', title: 'Sobre', description: 'Subtela Settings', component: SettingsAboutScreen },
      {
        name: 'SettingsDeleteAccount',
        title: 'Excluir conta',
        description: 'Subtela Settings',
        component: SettingsDeleteAccountScreen,
      },
    ],
  },
];

// Flat list for the stack navigator
const ALL_SCREENS: ScreenEntry[] = CATEGORIES.flatMap((c) => c.screens);

const SCREEN_NAMES = ALL_SCREENS.map((s) => s.name);
const SCREEN_ORDER_BY_NAME = new Map(
  ALL_SCREENS.map((screen, index) => [screen.name, index + 1]),
);

const isValidScreenName = (v: string | null): boolean =>
  v !== null && SCREEN_NAMES.includes(v);

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

const openInNewTab = (screenName: string) => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  const url = `${window.location.origin}/?preview=${encodeURIComponent(screenName)}`;
  window.open(url, '_blank');
};

const prepareScreenPreviewState = (screenName: string) => {
  const isTwoFactorPreview = screenName === 'TwoFactorLogin';

  authStore.setState({
    require2FA: isTwoFactorPreview,
    tempEmail: isTwoFactorPreview ? previewUserAuth.email : null,
    tempUserId: isTwoFactorPreview ? previewUserAuth.id : null,
    tempToken: isTwoFactorPreview ? 'preview-temp-token' : null,
    error: null,
    isLoading: false,
  });
};

const totalCount = ALL_SCREENS.length;

// ─────────────────────────────────────────────────────────
// Index screen
// ─────────────────────────────────────────────────────────

function PreviewIndexScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.dot} />
          <View>
            <Text style={s.headerTitle}>Meu Agito — Preview</Text>
            <Text style={s.headerSub}>{totalCount} telas disponíveis</Text>
          </View>
        </View>
        <View style={s.badge}>
          <Text style={s.badgeText}>DEV</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {CATEGORIES.map((cat) => (
          <View key={cat.label} style={s.catBlock}>
            {/* Category label */}
            <View style={[s.catLabel, { borderLeftColor: cat.color }]}>
              <Text style={s.catLabelText}>{cat.label}</Text>
              <Text style={s.catCount}>{cat.screens.length}</Text>
            </View>

            {/* Screen cards */}
            <View style={s.catGrid}>
              {cat.screens.map((screen) => (
                <View key={screen.name} style={s.card}>
                  <TouchableOpacity
                    style={s.cardMain}
                    onPress={() => {
                      prepareScreenPreviewState(screen.name);
                      navigation.navigate(screen.name);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir ${screen.title}, rota ${screen.name}`}
                  >
                    <View style={s.cardTopLine}>
                      <Text style={[s.cardStep, { color: cat.color }]}>
                        {String(SCREEN_ORDER_BY_NAME.get(screen.name) ?? 0).padStart(2, '0')}
                      </Text>
                      <Text style={s.cardTitle}>{screen.title}</Text>
                    </View>
                    <Text style={s.cardRoute}>Rota: {screen.name}</Text>
                    {screen.description ? (
                      <Text style={s.cardDescription}>{screen.description}</Text>
                    ) : null}
                  </TouchableOpacity>
                  {Platform.OS === 'web' ? (
                    <TouchableOpacity
                      style={s.cardNewTab}
                      onPress={() => openInNewTab(screen.name)}
                      accessibilityRole="button"
                      accessibilityLabel={`Abrir rota ${screen.name} em nova aba`}
                    >
                      <Feather name="external-link" size={14} color="#5A5A5A" />
                    </TouchableOpacity>
                  ) : null}
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// Back button overlay (shown on every preview screen)
// ─────────────────────────────────────────────────────────

function BackToIndex() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  return (
    <TouchableOpacity
      style={s.backBtn}
      onPress={() => navigation.navigate('PreviewIndex')}
      accessibilityRole="button"
      accessibilityLabel="Voltar ao índice"
    >
      <Feather name="grid" size={14} color="#FF6600" />
      <Text style={s.backBtnText}>Telas</Text>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────
// Wrapper that injects the back button on every preview screen
// ─────────────────────────────────────────────────────────

function withBackButton<P extends object>(WrappedScreen: React.ComponentType<P>) {
  return function PreviewWrapper(props: P) {
    return (
      <View style={{ flex: 1 }}>
        <WrappedScreen {...props} />
        <BackToIndex />
      </View>
    );
  };
}

// ─────────────────────────────────────────────────────────
// Navigator
// ─────────────────────────────────────────────────────────

const Stack = createNativeStackNavigator();

export function WebPreviewNavigator({
  previewScreenName,
}: {
  previewScreenName: string | null;
}) {
  const initialRoute =
    previewScreenName !== null && isValidScreenName(previewScreenName)
      ? previewScreenName
      : 'PreviewIndex';

  return (
    <Stack.Navigator
      key={initialRoute}
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false, animation: 'none' }}
    >
      <Stack.Screen name="PreviewIndex" component={PreviewIndexScreen} />
      {ALL_SCREENS.map((screen) => (
        <Stack.Screen
          key={screen.name}
          name={screen.name}
          component={withBackButton(screen.component)}
          initialParams={screen.initialParams}
        />
      ))}
    </Stack.Navigator>
  );
}

// ─────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E1E',
    backgroundColor: '#0A0A0A',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6600',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  headerSub: {
    color: '#5A5A5A',
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    backgroundColor: 'rgba(255,102,0,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,102,0,0.3)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#FF6600',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  scroll: {
    padding: 20,
    gap: 28,
  },
  catBlock: {
    gap: 10,
  },
  catLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 3,
    paddingLeft: 10,
  },
  catLabelText: {
    color: '#9A9A9A',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  catCount: {
    color: '#3A3A3A',
    fontSize: 11,
    fontWeight: '600',
  },
  catGrid: {
    gap: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    overflow: 'hidden',
  },
  cardMain: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cardTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardStep: {
    width: 22,
    fontSize: 11,
    fontWeight: '600',
  },
  cardTitle: {
    color: '#F5F5F5',
    fontSize: 14,
    fontWeight: '600',
  },
  cardRoute: {
    color: '#8A8A8A',
    fontSize: 12,
    marginTop: 4,
  },
  cardDescription: {
    color: '#5A5A5A',
    fontSize: 12,
    marginTop: 2,
  },
  cardNewTab: {
    width: 40,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#1E1E1E',
  },
  backBtn: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: 'rgba(255,102,0,0.3)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  backBtnText: {
    color: '#FF6600',
    fontSize: 13,
    fontWeight: '600',
  },
});
