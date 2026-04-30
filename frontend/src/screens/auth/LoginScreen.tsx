import React, { useEffect, useState } from 'react';
import {
  Alert,
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

import { Button, Input } from '@components';
import { colors } from '@constants/colors';
import { componentSizes, fontSize, spacing } from '@constants/design';
import { useAuth } from '@hooks/useAuth';
import { openLegalDocument } from '@services/legal/LegalLinks';

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const { login, error, clearError, require2FA, tempEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (text: string) => {
    setEmail(text);
    if (text && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
      setEmailError('Digite um e-mail valido');
      return;
    }

    setEmailError('');
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordError('');
    if (error) {
      clearError();
    }
  };

  const handleEmailLogin = async () => {
    if (!email.trim()) {
      setEmailError('O e-mail e obrigatorio');
      return;
    }

    if (emailError) {
      return;
    }

    if (!password) {
      setPasswordError('A senha e obrigatoria');
      return;
    }

    if (password.length < 8) {
      setPasswordError('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email.trim().toLowerCase(), password);

    if (!result.success) {
      Alert.alert('Erro', 'E-mail ou senha incorretos');
      setPassword('');
    }

    setIsSubmitting(false);
  };

  useEffect(() => {
    if (require2FA && tempEmail) {
      navigation.navigate('TwoFactorLogin' as never);
    }
  }, [navigation, require2FA, tempEmail]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>M</Text>
        </View>

        <Text style={styles.title}>Entre ou crie sua conta</Text>
        <Text style={styles.subtitle}>Descubra o que esta rolando na sua cidade</Text>

        <View style={styles.authScopeCard}>
          <Text style={styles.authScopeTitle}>Acesso validado neste build</Text>
          <Text style={styles.authScopeText}>
            O fluxo publico atual usa e-mail e senha. Se sua conta tiver 2FA habilitado, o app
            continua com o desafio do autenticador na etapa seguinte.
          </Text>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>continuar com e-mail</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.formSection}>
          <Input
            label="Email"
            placeholder="seu@email.com"
            value={email}
            onChangeText={validateEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isSubmitting}
            error={emailError}
          />

          <Input
            label="Senha"
            placeholder="********"
            value={password}
            onChangeText={handlePasswordChange}
            isPassword
            editable={!isSubmitting}
            error={passwordError || error || undefined}
          />

          {error && !emailError && !passwordError ? (
            <Text style={styles.errorMessage}>{error}</Text>
          ) : null}
        </View>

        <Button
          label="Entrar"
          onPress={handleEmailLogin}
          disabled={isSubmitting || !!emailError}
          loading={isSubmitting}
          fullWidth
          style={styles.loginButton}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword' as never)}
          style={styles.linkButton}
        >
          <Text style={styles.link}>Esqueci minha senha</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('ProfileSelection' as never)}
          style={styles.linkButtonCompact}
        >
          <Text style={styles.link}>Criar conta com e-mail</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('VerifyEmail' as never)}
          style={styles.linkButtonFinal}
        >
          <Text style={styles.link}>Reenviar verificacao de e-mail</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Ao usar o app voce concorda com nossos{' '}
            <Text
              style={styles.footerLink}
              onPress={() => {
                void openLegalDocument('terms');
              }}
            >
              Termos de uso
            </Text>{' '}
            e{' '}
            <Text
              style={styles.footerLink}
              onPress={() => {
                void openLegalDocument('privacy');
              }}
            >
              Politica de privacidade
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxxl,
  },
  logoContainer: {
    width: componentSizes.avatarXL,
    height: componentSizes.avatarXL,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.xxl,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  title: {
    fontSize: fontSize.huge,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  authScopeCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.xs,
  },
  authScopeTitle: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  authScopeText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xxl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    color: colors.textTertiary,
    fontSize: fontSize.sm,
  },
  formSection: {
    marginTop: spacing.xl,
  },
  errorMessage: {
    color: colors.error,
    fontSize: fontSize.sm,
    marginTop: spacing.md,
    fontWeight: '500',
  },
  loginButton: {
    marginTop: spacing.xl,
  },
  linkButton: {
    marginTop: spacing.lg,
  },
  linkButtonCompact: {
    marginTop: spacing.md,
  },
  linkButtonFinal: {
    marginTop: spacing.md,
    marginBottom: spacing.xxxl,
  },
  link: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    paddingTop: spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
  },
  footerLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
