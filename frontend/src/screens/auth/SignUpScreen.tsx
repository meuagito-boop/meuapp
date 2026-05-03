import React, { useState } from 'react';
import {
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
import { Button, Input } from '@components';
import { colors } from '@constants/colors';
import { spacing, fontSize } from '@constants/design';
import { openLegalDocument } from '@services/legal/LegalLinks';
import type { AccountType } from '@stores/authStore';
import {
  isAtLeast18,
  normalizeBirthDateInput,
  parseBirthDateToIso,
  parseName,
} from '@utils/signupValidation';

/**
 * SignUpScreen - T03c
 */
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

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [birthDateError, setBirthDateError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!profileType) {
    return (
      <View style={styles.missingProfileTypeContainer}>
        <Text style={styles.title}>Escolha o tipo de conta</Text>
        <Text style={styles.subtitle}>
          Para criar sua conta, selecione antes se ela sera pessoal ou empresarial.
        </Text>
        <Button
          label="Escolher tipo de conta"
          onPress={() => navigation.replace('ProfileSelection' as never)}
          fullWidth
          style={styles.missingProfileTypeButton}
        />
        <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
          <Text style={styles.footerText}>Ja tem conta? Faca login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleNameChange = (text: string) => {
    setName(text);

    if (!text) {
      setNameError('');
      return;
    }

    const parsedName = parseName(text);
    if (!parsedName) {
      setNameError('Digite nome e sobrenome validos');
    } else {
      setNameError('');
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);

    if (text && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
      setEmailError('Digite um e-mail valido');
    } else {
      setEmailError('');
    }
  };

  const handleBirthDateChange = (text: string) => {
    const formatted = normalizeBirthDateInput(text);
    setBirthDate(formatted);

    if (!formatted) {
      setBirthDateError('');
      return;
    }

    if (formatted.length < 10) {
      setBirthDateError('Use o formato DD/MM/AAAA');
      return;
    }

    const isoDate = parseBirthDateToIso(formatted);
    if (!isoDate) {
      setBirthDateError('Data de nascimento invalida');
      return;
    }

    if (!isAtLeast18(isoDate)) {
      setBirthDateError('Voce precisa ter pelo menos 18 anos');
      return;
    }

    setBirthDateError('');
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
    } else if (confirmPassword && text !== confirmPassword) {
      setConfirmError('As senhas nao coincidem');
    } else {
      setPasswordError('');
      setConfirmError('');
    }
    if (error) clearError();
  };

  const handleConfirmChange = (text: string) => {
    setConfirmPassword(text);
    if (text && password !== text) {
      setConfirmError('As senhas nao coincidem');
    } else {
      setConfirmError('');
    }
  };

  const handleSignUp = async () => {
    const parsedName = parseName(name);
    if (!parsedName) {
      setNameError('Nome e sobrenome validos sao obrigatorios');
      return;
    }

    if (!email.trim() || emailError) {
      setEmailError('E-mail valido e obrigatorio');
      return;
    }

    const isoBirthDate = parseBirthDateToIso(birthDate);
    if (!isoBirthDate) {
      setBirthDateError('Data de nascimento valida e obrigatoria');
      return;
    }

    if (!isAtLeast18(isoBirthDate)) {
      setBirthDateError('Voce precisa ter pelo menos 18 anos');
      return;
    }

    if (!password || password.length < 8) {
      setPasswordError('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmError('As senhas nao coincidem');
      return;
    }

    if (!termsAccepted) {
      Alert.alert('Termos obrigatorios', 'Voce deve aceitar os Termos e Politica de Privacidade');
      return;
    }

    setIsSubmitting(true);

    const result = await signup({
      email: email.trim().toLowerCase(),
      name: parsedName.fullName,
      firstName: parsedName.firstName,
      lastName: parsedName.lastName,
      birthDate: isoBirthDate,
      password,
      profileType,
      termsAccepted: true,
      privacyPolicyAccepted: true,
    });

    if (!result.success) {
      Alert.alert('Erro', result.error || 'Erro ao criar conta');
    } else {
      const verificationEmailSent =
        'verificationEmailSent' in result ? result.verificationEmailSent : true;
      const verificationMessage =
        verificationEmailSent === false
          ? 'Conta criada. Nao foi possivel enviar o e-mail agora. Use "Reenviar verificacao" na tela de login.'
          : 'Conta criada com sucesso. Enviamos um codigo de verificacao por e-mail.';
      const resolvedNextScreen = 'nextScreen' in result ? result.nextScreen : nextSetupScreen;

      Alert.alert('Sucesso', verificationMessage);
      navigation.replace(resolvedNextScreen as never);
    }

    setIsSubmitting(false);
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColor =
    passwordStrength === 'forte'
      ? colors.success
      : passwordStrength === 'media'
        ? colors.warning
        : colors.error;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>Preencha os dados abaixo para se cadastrar</Text>

        <View style={{ marginTop: spacing.xxl }}>
          <Input
            label="Nome completo"
            placeholder="Nome e sobrenome"
            value={name}
            onChangeText={handleNameChange}
            editable={!isSubmitting}
            error={nameError}
          />

          <Input
            label="Email"
            placeholder="seu@email.com"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isSubmitting}
            error={emailError}
          />

          <Input
            label="Data de nascimento"
            placeholder="DD/MM/AAAA"
            value={birthDate}
            onChangeText={handleBirthDateChange}
            keyboardType="number-pad"
            maxLength={10}
            editable={!isSubmitting}
            error={birthDateError}
          />

          <Input
            label="Senha"
            placeholder="********"
            value={password}
            onChangeText={handlePasswordChange}
            isPassword
            editable={!isSubmitting}
            error={passwordError}
          />

          {password && (
            <View style={styles.strengthContainer}>
              <View style={[styles.strengthBar, { backgroundColor: strengthColor }]} />
              <Text style={[{ color: strengthColor }, { fontSize: fontSize.sm }]}>
                Forca: {passwordStrength === 'forte' ? 'Forte' : passwordStrength === 'media' ? 'Media' : 'Fraca'}
              </Text>
            </View>
          )}

          <Input
            label="Confirmar senha"
            placeholder="********"
            value={confirmPassword}
            onChangeText={handleConfirmChange}
            isPassword
            editable={!isSubmitting}
            error={confirmError}
          />

          <TouchableOpacity onPress={() => setTermsAccepted(!termsAccepted)} style={styles.checkboxContainer}>
            <View style={[styles.checkbox, termsAccepted && { backgroundColor: colors.primary }]}>
              {termsAccepted && <Text style={styles.checkmark}>OK</Text>}
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
                Politica de Privacidade
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.errorMessage}>{error}</Text>}

        <Button
          label="Criar conta"
          onPress={handleSignUp}
          disabled={
            isSubmitting ||
            !termsAccepted ||
            !!nameError ||
            !!emailError ||
            !!birthDateError ||
            !!passwordError ||
            !!confirmError
          }
          loading={isSubmitting}
          fullWidth
          style={{ marginTop: spacing.xl }}
        />

        <TouchableOpacity onPress={() => navigation.navigate('Login' as never)} style={{ marginTop: spacing.xl, marginBottom: spacing.xxxl }}>
          <Text style={styles.footerText}>
            Ja tem conta? <Text style={styles.link}>Faca login</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  missingProfileTypeContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  missingProfileTypeButton: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  backButton: {
    marginBottom: spacing.xl,
  },
  backText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  title: {
    fontSize: fontSize.huge,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  strengthContainer: {
    marginBottom: spacing.lg,
  },
  strengthBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.sm,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: spacing.lg,
    gap: spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  checkmark: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 9,
  },
  checkboxText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  errorMessage: {
    color: colors.error,
    fontSize: fontSize.sm,
    marginTop: spacing.md,
    fontWeight: '500',
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});
