import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

import { useNavigation, useRoute, ParamListBase, type RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '@hooks/useAuth';
import { Button, Input, ScreenHeader } from '@components';
import { colors } from '@constants/colors';
import { spacing, fontSize } from '@constants/design';
import GeolocationService, {
  type LocationCountryContext,
} from '@services/geolocation/GeolocationService';
import { openLegalDocument } from '@services/legal/LegalLinks';
import type { AccountType } from '@stores/authStore';
import {
  isAllowedSignupAge,
  parseBirthDatePartsToIso,
  resolveMinimumSignupAge,
  validateNamePart,
} from '@utils/signupValidation';
import { AuthBackground, authPanelStyle } from './authLayout';

const DAY_OPTIONS = Array.from({ length: 31 }, (_, index) =>
  String(index + 1).padStart(2, '0'),
);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, '0'),
);
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 121 }, (_, index) => String(CURRENT_YEAR - index));

type BirthDateField = 'day' | 'month' | 'year';

export default function SignUpScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<ParamListBase>>();
  const { signup, error, clearError } = useAuth();

  const routeParams = route.params as
    | {
        profileType?: AccountType;
        nextSetupScreen?: 'PersonalSetup' | 'BusinessSetup';
      }
    | undefined;

  const profileType = routeParams?.profileType;
  const nextSetupScreen =
    routeParams?.nextSetupScreen ??
    (profileType === 'ESTABLISHMENT' ? 'BusinessSetup' : 'PersonalSetup');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [openBirthField, setOpenBirthField] = useState<BirthDateField | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [locationContext, setLocationContext] = useState<LocationCountryContext | null>(null);
  const [isResolvingLocation, setIsResolvingLocation] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [birthDateError, setBirthDateError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const birthDateIso = useMemo(
    () => parseBirthDatePartsToIso(birthDay, birthMonth, birthYear),
    [birthDay, birthMonth, birthYear],
  );
  const minimumSignupAge = resolveMinimumSignupAge(locationContext?.countryCode);
  const countryLabel =
    locationContext?.countryName || locationContext?.countryCode || 'seu pais';

  useEffect(() => {
    let isMounted = true;

    const resolveSignupLocation = async () => {
      setIsResolvingLocation(true);
      setLocationError(null);

      try {
        const context = await GeolocationService.getCurrentCountryContext();
        if (!isMounted) {
          return;
        }

        setLocationContext(context);
        if (!context.countryCode) {
          setLocationError('Nao foi possivel confirmar seu pais pela localizacao.');
        }
      } catch {
        if (!isMounted) {
          return;
        }

        setLocationContext(null);
        setLocationError('Permita a localizacao para concluir o cadastro.');
      } finally {
        if (isMounted) {
          setIsResolvingLocation(false);
        }
      }
    };

    void resolveSignupLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!birthDay && !birthMonth && !birthYear) {
      return;
    }

    if (!birthDateIso) {
      setBirthDateError('Selecione uma data de nascimento válida.');
      return;
    }

    if (!locationContext?.countryCode) {
      setBirthDateError('Confirme sua localização para validar a idade mínima.');
      return;
    }

    if (!isAllowedSignupAge(birthDateIso, locationContext.countryCode)) {
      setBirthDateError('Impossível realizar seu cadastro no momento.');
      return;
    }

    setBirthDateError('');
  }, [birthDateIso, birthDay, birthMonth, birthYear, locationContext?.countryCode]);

  if (!profileType) {
    return (
      <AuthBackground>
        <View style={styles.missingProfileTypeContainer}>
          <View style={styles.missingProfileTypeCard}>
            <Text style={styles.title}>Escolha o tipo de conta</Text>
            <Text style={styles.subtitle}>
              Para continuar, escolha se sua conta será pessoal ou empresarial.
            </Text>

            <Button
              label="Escolher tipo"
              onPress={() => navigation.replace('ProfileSelection' as never)}
              fullWidth
              style={styles.missingProfileTypeButton}
            />

            <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
              <Text style={styles.footerText}>
                Já tem conta? <Text style={styles.link}>Entrar</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </AuthBackground>
    );
  }

  const handleFirstNameChange = (text: string) => {
    setFirstName(text);

    if (!text) {
      setFirstNameError('');
      return;
    }

    const validation = validateNamePart(text, 'nome');
    setFirstNameError(validation.error ?? '');
  };

  const handleLastNameChange = (text: string) => {
    setLastName(text);

    if (!text) {
      setLastNameError('');
      return;
    }

    const validation = validateNamePart(text, 'sobrenome');
    setLastNameError(validation.error ?? '');
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);

    if (text && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
      setEmailError('Digite um e-mail válido');
    } else {
      setEmailError('');
    }
  };

  const validateBirthDateSelection = (
    day = birthDay,
    month = birthMonth,
    year = birthYear,
  ) => {
    if (!day && !month && !year) {
      setBirthDateError('');
      return;
    }

    const nextIsoDate = parseBirthDatePartsToIso(day, month, year);
    if (!nextIsoDate) {
      setBirthDateError('Selecione uma data de nascimento válida.');
      return;
    }

    if (!locationContext?.countryCode) {
      setBirthDateError('Confirme sua localização para validar a idade mínima.');
      return;
    }

    if (!isAllowedSignupAge(nextIsoDate, locationContext.countryCode)) {
      setBirthDateError('Impossível realizar seu cadastro no momento.');
      return;
    }

    setBirthDateError('');
  };

  const selectBirthDatePart = (field: BirthDateField, value: string) => {
    const nextDay = field === 'day' ? value : birthDay;
    const nextMonth = field === 'month' ? value : birthMonth;
    const nextYear = field === 'year' ? value : birthYear;

    setBirthDay(nextDay);
    setBirthMonth(nextMonth);
    setBirthYear(nextYear);
    setOpenBirthField(null);
    validateBirthDateSelection(nextDay, nextMonth, nextYear);
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 'fraca';

    const hasNumber = /\d/.test(pwd);
    const hasSymbol = /[!@#$%^&*]/.test(pwd);
    const hasLength = pwd.length >= 12;

    if (hasLength && hasNumber && hasSymbol) return 'forte';
    if (pwd.length >= 10 && (hasNumber || hasSymbol)) return 'media';

    return 'fraca';
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);

    if (text && text.length < 8) {
      setPasswordError('A senha deve ter pelo menos 8 caracteres');
    } else {
      setPasswordError('');
    }

    if (confirmPassword && text !== confirmPassword) {
      setConfirmError('As senhas não coincidem');
    } else {
      setConfirmError('');
    }

    if (error) {
      clearError();
    }
  };

  const handleConfirmChange = (text: string) => {
    setConfirmPassword(text);

    if (text && password !== text) {
      setConfirmError('As senhas não coincidem');
    } else {
      setConfirmError('');
    }
  };

  const handleSignUp = async () => {
    const firstNameValidation = validateNamePart(firstName, 'nome');
    if (!firstNameValidation.valid) {
      setFirstNameError(firstNameValidation.error ?? 'Nome válido é obrigatório');
      return;
    }

    const lastNameValidation = validateNamePart(lastName, 'sobrenome');
    if (!lastNameValidation.valid) {
      setLastNameError(lastNameValidation.error ?? 'Sobrenome válido é obrigatório');
      return;
    }

    if (!email.trim() || emailError) {
      setEmailError('E-mail válido é obrigatório');
      return;
    }

    if (!birthDateIso) {
      setBirthDateError('Data de nascimento válida é obrigatória');
      return;
    }

    if (!locationContext?.countryCode) {
      setBirthDateError('Confirme sua localização para validar a idade mínima.');
      return;
    }

    if (!isAllowedSignupAge(birthDateIso, locationContext.countryCode)) {
      setBirthDateError('Impossível realizar seu cadastro no momento.');
      return;
    }

    if (!password || password.length < 8) {
      setPasswordError('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmError('As senhas não coincidem');
      return;
    }

    if (!termsAccepted) {
      Alert.alert('Termos obrigatórios', 'Você deve aceitar os Termos e Política de Privacidade');
      return;
    }

    setIsSubmitting(true);

    const result = await signup({
      email: email.trim().toLowerCase(),
      name: `${firstNameValidation.value} ${lastNameValidation.value}`,
      firstName: firstNameValidation.value,
      lastName: lastNameValidation.value,
      birthDate: birthDateIso,
      password,
      profileType,
      termsAccepted: true,
      privacyPolicyAccepted: true,
      legalCountryCode: locationContext.countryCode,
      legalCountryName: locationContext.countryName,
    });

    if (!result.success) {
      Alert.alert('Erro', result.error || 'Erro ao criar conta');
    } else {
      const verificationEmailSent =
        'verificationEmailSent' in result ? result.verificationEmailSent : true;

      const verificationMessage =
        verificationEmailSent === false
          ? 'Conta criada. Não foi possível enviar o e-mail agora. Use a tela de verificação de e-mail para solicitar um novo código.'
          : 'Conta criada com sucesso. Enviamos um código de verificação por e-mail.';

      const resolvedNextScreen = 'nextScreen' in result ? result.nextScreen : nextSetupScreen;

      Alert.alert('Sucesso', verificationMessage);
      navigation.replace(resolvedNextScreen as never);
    }

    setIsSubmitting(false);
  };

  const renderBirthSelector = (
    field: BirthDateField,
    label: string,
    value: string,
    placeholder: string,
    options: string[],
  ) => {
    const isOpen = openBirthField === field;

    return (
      <View style={styles.birthField}>
        <Text style={styles.birthFieldLabel}>{label}</Text>
        <TouchableOpacity
          onPress={() => setOpenBirthField((current) => (current === field ? null : field))}
          style={[
            styles.birthSelect,
            isOpen && styles.birthSelectOpen,
            birthDateError ? styles.birthSelectError : null,
          ]}
          activeOpacity={0.78}
          accessibilityRole="button"
          accessibilityLabel={`Selecionar ${label.toLowerCase()} de nascimento`}
          disabled={isSubmitting}
        >
          <Text style={[styles.birthSelectText, !value && styles.birthSelectPlaceholder]}>
            {value || placeholder}
          </Text>
          <Text style={styles.birthSelectChevron}>{isOpen ? '^' : 'v'}</Text>
        </TouchableOpacity>

        {isOpen ? (
          <View style={styles.birthDropdown}>
            <ScrollView nestedScrollEnabled showsVerticalScrollIndicator>
              {options.map((option) => (
                <TouchableOpacity
                  key={`${field}-${option}`}
                  onPress={() => selectBirthDatePart(field, option)}
                  style={[
                    styles.birthOption,
                    value === option && styles.birthOptionSelected,
                  ]}
                  activeOpacity={0.72}
                >
                  <Text
                    style={[
                      styles.birthOptionText,
                      value === option && styles.birthOptionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </View>
    );
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColor =
    passwordStrength === 'forte'
      ? colors.success
      : passwordStrength === 'media'
        ? colors.warning
        : colors.error;

  const isCreateDisabled =
    isSubmitting ||
    isResolvingLocation ||
    !!locationError ||
    !locationContext?.countryCode ||
    !termsAccepted ||
    !firstName.trim() ||
    !lastName.trim() ||
    !email.trim() ||
    !birthDateIso ||
    !password ||
    !confirmPassword ||
    !!firstNameError ||
    !!lastNameError ||
    !!emailError ||
    !!birthDateError ||
    !!passwordError ||
    !!confirmError;

  return (
    <AuthBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScreenHeader title="" onBack={() => navigation.goBack()} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.innerContent}>
            <View style={styles.hero}>
              <Text style={styles.title}>Criar conta</Text>
              <Text style={styles.subtitle}>
                Preencha seus dados para começar no Meu Agito.
              </Text>
            </View>

            <View style={styles.formCard}>
              <Input
                label="Nome"
                placeholder="Seu primeiro nome"
                value={firstName}
                onChangeText={handleFirstNameChange}
                editable={!isSubmitting}
                error={firstNameError}
              />

              <Input
                label="Sobrenome"
                placeholder="Seu sobrenome"
                value={lastName}
                onChangeText={handleLastNameChange}
                editable={!isSubmitting}
                error={lastNameError}
              />

              <Input
                label="E-mail"
                placeholder="seu@email.com"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isSubmitting}
                error={emailError}
              />

              <View style={styles.birthDateContainer}>
                <View style={styles.birthDateHeader}>
                  <Text style={styles.birthDateLabel}>Data de nascimento</Text>
                  <Text style={styles.birthDateHint}>
                    Idade minima em {countryLabel}: {minimumSignupAge} anos
                  </Text>
                </View>

                <View style={styles.birthDateRow}>
                  {renderBirthSelector('day', 'Dia', birthDay, 'DD', DAY_OPTIONS)}
                  {renderBirthSelector('month', 'Mes', birthMonth, 'MM', MONTH_OPTIONS)}
                  {renderBirthSelector('year', 'Ano', birthYear, 'AAAA', YEAR_OPTIONS)}
                </View>

                {birthDateError ? (
                  <Text style={styles.fieldErrorText}>{birthDateError}</Text>
                ) : null}
              </View>

              <View style={styles.locationNotice}>
                {isResolvingLocation ? (
                  <>
                    <ActivityIndicator color={colors.primary} size="small" />
                    <Text style={styles.locationNoticeText}>
                      Confirmando pais pela localizacao...
                    </Text>
                  </>
                ) : (
                  <Text
                    style={[
                      styles.locationNoticeText,
                      locationError ? styles.locationNoticeTextError : null,
                    ]}
                  >
                    {locationError ??
                      `Pais confirmado: ${countryLabel}. A validacao de idade usara esta localizacao.`}
                  </Text>
                )}
              </View>

              <Input
                label="Senha"
                placeholder="Digite sua senha"
                value={password}
                onChangeText={handlePasswordChange}
                isPassword
                editable={!isSubmitting}
                error={passwordError}
              />

              {password ? (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthTrack}>
                    <View
                      style={[
                        styles.strengthBar,
                        {
                          backgroundColor: strengthColor,
                          width:
                            passwordStrength === 'forte'
                              ? '100%'
                              : passwordStrength === 'media'
                                ? '66%'
                                : '33%',
                        },
                      ]}
                    />
                  </View>

                  <Text style={[styles.strengthText, { color: strengthColor }]}>
                    Força: {passwordStrength === 'forte' ? 'Forte' : passwordStrength === 'media' ? 'Média' : 'Fraca'}
                  </Text>
                </View>
              ) : null}

              <Input
                label="Confirmar senha"
                placeholder="Repita sua senha"
                value={confirmPassword}
                onChangeText={handleConfirmChange}
                isPassword
                editable={!isSubmitting}
                error={confirmError}
              />

              <TouchableOpacity
                onPress={() => setTermsAccepted(!termsAccepted)}
                style={styles.checkboxContainer}
                activeOpacity={0.78}
              >
                <View style={[styles.checkbox, termsAccepted && styles.checkboxAccepted]}>
                  {termsAccepted ? <Text style={styles.checkmark}>✓</Text> : null}
                </View>

                <Text style={styles.checkboxText}>
                  Concordo com os{' '}
                  <Text
                    style={styles.link}
                    onPress={() => {
                      void openLegalDocument('terms');
                    }}
                  >
                    Termos de Uso
                  </Text>{' '}
                  e{' '}
                  <Text
                    style={styles.link}
                    onPress={() => {
                      void openLegalDocument('privacy');
                    }}
                  >
                    Política de Privacidade
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

            <Button
              label="Criar conta"
              onPress={handleSignUp}
              disabled={isCreateDisabled}
              loading={isSubmitting}
              fullWidth
              size="large"
              style={styles.submitButton}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('Login' as never)}
              style={styles.loginFooterLink}
              activeOpacity={0.75}
            >
              <Text style={styles.footerText}>
                Já tem conta? <Text style={styles.link}>Entrar</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  missingProfileTypeContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },

  missingProfileTypeCard: {
    ...authPanelStyle,
    maxWidth: 420,
    alignSelf: 'center',
    alignItems: 'center',
  },

  missingProfileTypeButton: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    borderRadius: 999,
  },

  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },

  innerContent: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },

  hero: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },

  title: {
    fontSize: 30,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },

  subtitle: {
    maxWidth: 320,
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 22,
    marginTop: spacing.sm,
    textAlign: 'center',
  },

  formCard: {
    ...authPanelStyle,
    borderRadius: 26,
  },

  birthDateContainer: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },

  birthDateHeader: {
    gap: 2,
  },

  birthDateLabel: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },

  birthDateHint: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },

  birthDateRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },

  birthField: {
    flex: 1,
    minWidth: 0,
  },

  birthFieldLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 6,
  },

  birthSelect: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },

  birthSelectOpen: {
    borderColor: colors.primary,
  },

  birthSelectError: {
    borderColor: colors.error,
  },

  birthSelectText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '500',
  },

  birthSelectPlaceholder: {
    color: colors.textSecondary,
  },

  birthSelectChevron: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },

  birthDropdown: {
    maxHeight: 156,
    marginTop: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSurface2,
    overflow: 'hidden',
  },

  birthOption: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },

  birthOptionSelected: {
    backgroundColor: 'rgba(255,106,0,0.14)',
  },

  birthOptionText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },

  birthOptionTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },

  fieldErrorText: {
    color: colors.error,
    fontSize: 12,
    lineHeight: 17,
  },

  locationNotice: {
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: spacing.lg,
  },

  locationNoticeText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },

  locationNoticeTextError: {
    color: colors.error,
  },

  strengthContainer: {
    marginBottom: spacing.lg,
  },

  strengthTrack: {
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },

  strengthBar: {
    height: '100%',
    borderRadius: 999,
  },

  strengthText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },

  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.lg,
    gap: spacing.md,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },

  checkboxAccepted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  checkmark: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 13,
  },

  checkboxText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 19,
  },

  link: {
    color: colors.primary,
    fontWeight: '600',
  },

  errorMessage: {
    color: colors.error,
    fontSize: fontSize.sm,
    marginTop: spacing.md,
    fontWeight: '500',
  },

  submitButton: {
    marginTop: spacing.xl,
    borderRadius: 999,
  },

  loginFooterLink: {
    marginTop: spacing.xl,
    marginBottom: spacing.xxxl,
  },

  footerText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});
