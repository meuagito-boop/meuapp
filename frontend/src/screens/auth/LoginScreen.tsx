import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '@components';
import { colors } from '@constants/colors';
import { useAuth } from '@hooks/useAuth';
import { isUiPreviewModeEnabled } from '@config/uiPreview';
import GeolocationService, {
  type LocationCountryContext,
} from '@services/geolocation/GeolocationService';
import { openLegalDocument } from '@services/legal/LegalLinks';
import { deleteItemAsync, getItemAsync, setItemAsync } from '@utils/secureStorage';
import { AuthBackground, authPanelStyle } from './authLayout';

// Metro/Expo resolves static image assets through require.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const LOGIN_LOGO = require('../../../assets/icon.png');

const REMEMBER_LOGIN_STORAGE_KEY = 'meuagito_remember_login_credentials';

type RememberedLoginCredentials = {
  email: string;
  password: string;
};

type LocationGateStatus = 'checking' | 'requesting' | 'granted' | 'denied' | 'error';

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const { login, error, clearError, require2FA, tempEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [locationGateStatus, setLocationGateStatus] =
    useState<LocationGateStatus>('checking');
  const [locationGateMessage, setLocationGateMessage] = useState(
    'Verificando permissão de localização...',
  );
  const [loginLocationContext, setLoginLocationContext] =
    useState<LocationCountryContext | null>(null);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isLocationReady = locationGateStatus === 'granted';
  const canSubmit =
    isLocationReady && isEmailValid && password.length >= 8 && !isSubmitting && !emailError;

  const validateEmail = (text: string) => {
    setEmail(text);
    if (error) clearError();

    if (text && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
      setEmailError('Digite um e-mail válido');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordError('');
    if (error) clearError();
  };

  const closeAppAfterDeniedLocation = useCallback(() => {
    if (Platform.OS === 'android') {
      BackHandler.exitApp();
      return;
    }

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.close();
    }
  }, []);

  const requestRequiredLocation = useCallback(async () => {
    setLocationGateStatus('checking');
    setLocationGateMessage('Verificando permissão de localização...');

    try {
      const hasPermission = await GeolocationService.hasPermission();
      let granted = hasPermission;

      if (!granted) {
        setLocationGateStatus('requesting');
        setLocationGateMessage('Precisamos da sua localização para liberar login e cadastro.');
        granted = await GeolocationService.requestPermission();
      }

      if (!granted) {
        setLoginLocationContext(null);
        setLocationGateStatus('denied');
        setLocationGateMessage('A localização é obrigatória para usar o Meu Agito.');
        Alert.alert(
          'Localização obrigatória',
          'Não conseguimos continuar sem a permissão de localização. O aplicativo será encerrado.',
          [{ text: 'Fechar app', onPress: closeAppAfterDeniedLocation }],
        );
        return;
      }

      const context = await GeolocationService.getCurrentCountryContext();
      setLoginLocationContext(context);
      setLocationGateStatus('granted');
      setLocationGateMessage(
        context.countryName
          ? `Localização confirmada: ${context.countryName}.`
          : 'Localização confirmada.',
      );
    } catch (locationError) {
      const message =
        locationError instanceof Error
          ? locationError.message
          : 'Não foi possível confirmar sua localização.';

      setLoginLocationContext(null);
      setLocationGateStatus('error');
      setLocationGateMessage(message);
    }
  }, [closeAppAfterDeniedLocation]);

  const handleLogin = async () => {
    if (!isLocationReady) {
      Alert.alert('Localização obrigatória', 'Permita a localização para entrar ou criar conta.');
      return;
    }

    if (!email.trim()) { setEmailError('O e-mail é obrigatório'); return; }
    if (!isEmailValid) { setEmailError('Digite um e-mail válido'); return; }
    if (!password) { setPasswordError('A senha é obrigatória'); return; }
    if (password.length < 8) { setPasswordError('Mínimo 8 caracteres'); return; }

    setIsSubmitting(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const result = await login(normalizedEmail, password);

      if (!result.success) {
        Alert.alert('Erro ao entrar', 'E-mail ou senha incorretos');
        setPassword('');
        return;
      }

      if (rememberMe) {
        await setItemAsync(
          REMEMBER_LOGIN_STORAGE_KEY,
          JSON.stringify({ email: normalizedEmail, password }),
        );
      } else {
        await deleteItemAsync(REMEMBER_LOGIN_STORAGE_KEY);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadRememberedCredentials = async () => {
      try {
        const savedCredentials = await getItemAsync(REMEMBER_LOGIN_STORAGE_KEY);
        if (!savedCredentials || !isMounted) {
          return;
        }

        const parsed = JSON.parse(savedCredentials) as Partial<RememberedLoginCredentials>;
        if (typeof parsed.email === 'string' && typeof parsed.password === 'string') {
          setEmail(parsed.email);
          setPassword(parsed.password);
          setRememberMe(true);
        }
      } catch {
        await deleteItemAsync(REMEMBER_LOGIN_STORAGE_KEY);
      }
    };

    void loadRememberedCredentials();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    void requestRequiredLocation();
  }, [requestRequiredLocation]);

  useEffect(() => {
    if (isUiPreviewModeEnabled()) {
      return;
    }

    if (require2FA && tempEmail) {
      navigation.navigate('TwoFactorLogin' as never);
    }
  }, [navigation, require2FA, tempEmail]);

  const terms = (
    <Text style={styles.legalText}>
      Ao continuar, você concorda com os{' '}
      <Text style={styles.legalLink} onPress={() => { void openLegalDocument('terms'); }}>
        Termos de Uso
      </Text>
      {' '}e{' '}
      <Text style={styles.legalLink} onPress={() => { void openLegalDocument('privacy'); }}>
        Política de Privacidade
      </Text>
    </Text>
  );

  return (
    <AuthBackground overlayOpacity={0.62}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.logoWrap}>
              <Image
                source={LOGIN_LOGO}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <View style={styles.bottom}>
              <View style={styles.copy}>
                <Text style={styles.heroTitle}>
                  Descubra o que está rolando perto de você
                </Text>
                <Text style={styles.heroSubtitle}>
                  Rede social, eventos e comércios da sua cidade em um só lugar.
                </Text>
              </View>

              <View
                style={[
                  styles.locationGate,
                  !isLocationReady && styles.locationGateAttention,
                ]}
              >
                {locationGateStatus === 'checking' || locationGateStatus === 'requesting' ? (
                  <ActivityIndicator color={colors.brand} size="small" />
                ) : null}
                <View style={styles.locationGateTextWrap}>
                  <Text style={styles.locationGateTitle}>
                    {isLocationReady ? 'Localização ativa' : 'Localização obrigatória'}
                  </Text>
                  <Text style={styles.locationGateMessage}>
                    {locationGateMessage}
                    {isLocationReady && loginLocationContext?.countryCode
                      ? ` Pais: ${loginLocationContext.countryCode}.`
                      : ''}
                  </Text>
                </View>
                {!isLocationReady ? (
                  <TouchableOpacity
                    onPress={requestRequiredLocation}
                    style={styles.locationGateButton}
                    activeOpacity={0.76}
                    accessibilityRole="button"
                    accessibilityLabel="Permitir localização"
                  >
                    <Text style={styles.locationGateButtonText}>Permitir</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {showLoginForm ? (
                <View style={styles.form}>
                  <View style={styles.formHeader}>
                    <View>
                      <Text style={styles.formTitle}>Entrar</Text>
                      <Text style={styles.formSubtitle}>Acesse sua conta existente.</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setShowLoginForm(false)}
                      style={styles.closeFormButton}
                      activeOpacity={0.75}
                      accessibilityRole="button"
                      accessibilityLabel="Fechar formulário de login"
                    >
                      <Text style={styles.closeFormText}>×</Text>
                    </TouchableOpacity>
                  </View>

                  <Input
                    label="E-mail"
                    placeholder="seu@email.com"
                    value={email}
                    onChangeText={validateEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isSubmitting}
                    error={emailError}
                    leftIcon="mail"
                    containerStyle={styles.inputContainer}
                  />

                  <Input
                    label="Senha"
                    placeholder="Sua senha"
                    value={password}
                    onChangeText={handlePasswordChange}
                    isPassword
                    editable={!isSubmitting}
                    error={passwordError || error || undefined}
                    leftIcon="lock"
                    containerStyle={styles.inputContainer}
                  />

                  <View style={styles.formOptions}>
                    <TouchableOpacity
                      onPress={() => setRememberMe((current) => !current)}
                      style={styles.rememberWrap}
                      activeOpacity={0.75}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: rememberMe }}
                      accessibilityLabel="Lembrar e-mail e senha"
                    >
                      <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                        {rememberMe ? <Text style={styles.checkboxMark}>✓</Text> : null}
                      </View>
                      <Text style={styles.rememberText}>Lembrar de mim</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => navigation.navigate('ForgotPassword' as never)}
                      style={styles.forgotWrap}
                      activeOpacity={0.75}
                      accessibilityRole="button"
                      accessibilityLabel="Recuperar senha"
                    >
                      <Text style={styles.forgot}>Esqueci minha senha</Text>
                    </TouchableOpacity>
                  </View>

                  <Button
                    label="Entrar"
                    onPress={handleLogin}
                    disabled={!canSubmit}
                    loading={isSubmitting}
                    fullWidth
                    size="large"
                    labelStyle={styles.submitText}
                  />
                </View>
              ) : (
                <View style={styles.actions}>
                  <Button
                    label="Entrar"
                    onPress={() => setShowLoginForm(true)}
                    disabled={!isLocationReady}
                    fullWidth
                    size="large"
                    labelStyle={styles.primaryActionText}
                  />
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ProfileSelection' as never)}
                    disabled={!isLocationReady}
                    style={[
                      styles.loginLinkWrap,
                      !isLocationReady && styles.disabledAction,
                    ]}
                    activeOpacity={0.75}
                    accessibilityRole="link"
                    accessibilityLabel="Criar uma nova conta"
                  >
                    <Text style={styles.loginLinkText}>
                      Ainda não tem uma conta? <Text style={styles.loginLinkAccent}>Criar conta</Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {terms}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  logoWrap: {
    alignItems: 'center',
  },
  logo: {
    width: 44,
    height: 44,
  },
  bottom: {
    ...authPanelStyle,
    gap: 12,
  },
  copy: {
    gap: 8,
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  heroSubtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  locationGate: {
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationGateAttention: {
    borderColor: 'rgba(255,102,0,0.42)',
    backgroundColor: 'rgba(255,102,0,0.12)',
  },
  locationGateTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  locationGateTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  locationGateMessage: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  locationGateButton: {
    minHeight: 34,
    borderRadius: 999,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
  },
  locationGateButtonText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  disabledAction: {
    opacity: 0.45,
  },
  primaryActionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  loginLinkWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  loginLinkText: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
  loginLinkAccent: {
    color: colors.brand,
    fontWeight: '600',
  },
  form: {
    gap: 12,
    marginTop: 8,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  formTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
  },
  formSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  closeFormButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  closeFormText: {
    color: colors.textPrimary,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '300',
  },
  inputContainer: {
    marginBottom: 0,
  },
  formOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rememberWrap: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.bgSurface3,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: colors.brand,
    backgroundColor: colors.brand,
  },
  checkboxMark: {
    color: colors.textInverse,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 16,
  },
  rememberText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  forgotWrap: {
    paddingVertical: 4,
    flexShrink: 0,
  },
  forgot: {
    color: colors.brand,
    fontSize: 13,
    fontWeight: '500',
  },
  submitText: {
    fontSize: 15,
    fontWeight: '600',
  },
  legalText: {
    color: colors.textTertiary,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  legalLink: {
    color: colors.brand,
  },
});
