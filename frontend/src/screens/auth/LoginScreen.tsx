import React, { useState, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@hooks/useAuth';
import { Button, Input, Loading } from '@components';
import { colors } from '@constants/colors';
import { spacing, fontSize, componentSizes } from '@constants/design';

/**
 * LoginScreen - T03 Design Approve
 * Métodos: Google · Apple (iOS) · Telefone · Email/Senha
 * Validações LGPD compliantes, rate limiting, termos obrigatórios
 */
export default function LoginScreen() {
  const navigation = useNavigation();
  const { login, isLoading, error, clearError, require2FA, tempEmail } = useAuth();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validar email em tempo real
  const validateEmail = (text: string) => {
    setEmail(text);
    if (text && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
      setEmailError('Digite um e-mail válido');
    } else {
      setEmailError('');
    }
  };

  // Limpar erro ao digitar
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordError('');
    if (error) clearError();
  };

  // Login com email/senha
  const handleEmailLogin = async () => {
    // Validação preliminar
    if (!email.trim()) {
      setEmailError('O e-mail é obrigatório');
      return;
    }
    if (emailError) return;
    if (!password) {
      setPasswordError('A senha é obrigatória');
      return;
    }
    if (password.length < 8) {
      setPasswordError('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);

    if (!result.success) {
      // Erro genérico por segurança (SEC)
      Alert.alert('Erro', 'E-mail ou senha incorretos');
      setPassword('');
    } else if (require2FA) {
      // 2FA necessário
      navigation.navigate('TwoFA' as never, { email: tempEmail } as never);
    } else {
      // Login bem-sucedido
      navigation.navigate('Home' as never);
    }

    setIsSubmitting(false);
  };

  // Se já requer 2FA, skip desta tela
  useEffect(() => {
    if (require2FA && tempEmail) {
      navigation.navigate('TwoFA' as never, { email: tempEmail } as never);
    }
  }, [require2FA, tempEmail, navigation]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>M</Text>
        </View>

        {/* Título */}
        <Text style={styles.title}>Entre ou crie sua conta</Text>
        <Text style={styles.subtitle}>
          Descubra o que está rolando na sua cidade
        </Text>

        {/* Botões Sociais */}
        <View style={styles.socialContainer}>
          {/* Google */}
          <Button
            label="Continuar com Google"
            onPress={() => {
              Alert.alert('Em Breve', 'Google Sign-In será implementado');
            }}
            variant="secondary"
            fullWidth
            style={{ marginBottom: spacing.md }}
          />

          {/* Apple (iOS only) */}
          {Platform.OS === 'ios' && (
            <Button
              label="Continuar com Apple"
              onPress={() => {
                Alert.alert('Em Breve', 'Apple Sign-In será implementado');
              }}
              variant="secondary"
              fullWidth
              style={{ marginBottom: spacing.md }}
            />
          )}

          {/* Telefone */}
          <Button
            label="Continuar com telefone"
            onPress={() => navigation.navigate('SMSLogin' as never)}
            variant="ghost"
            fullWidth
            style={{ marginBottom: spacing.xl }}
          />
        </View>

        {/* Divisor */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou continue com e-mail</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Form Email/Senha */}
        <View style={{ marginTop: spacing.xxl }}>
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
            placeholder="••••••••"
            value={password}
            onChangeText={handlePasswordChange}
            isPassword
            editable={!isSubmitting}
            error={passwordError || error}
          />

          {/* Erro genérico de autenticação */}
          {error && !emailError && !passwordError && (
            <Text style={styles.errorMessage}>{error}</Text>
          )}
        </View>

        {/* Botão Entrar */}
        <Button
          label="Entrar"
          onPress={handleEmailLogin}
disabled={isSubmitting || !!emailError}
          loading={isSubmitting}
          fullWidth
          style={{ marginTop: spacing.xl }}
        />

        {/* Links auxiliares */}
        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword' as never)}
          style={{ marginTop: spacing.lg }}
        >
          <Text style={styles.link}>Esqueci minha senha</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('SignUp' as never)}
          style={{ marginTop: spacing.md, marginBottom: spacing.xxxl }}
        >
          <Text style={styles.link}>Criar conta com e-mail</Text>
        </TouchableOpacity>

        {/* Termos & Privacidade */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Ao usar o app você concorda com nossos{' '}
            <Text
              style={styles.footerLink}
              onPress={() => Alert.alert('Termos')}
            >
              Termos de uso
            </Text>{' '}
            e{' '}
            <Text
              style={styles.footerLink}
              onPress={() => Alert.alert('Privacidade')}
            >
              Política de privacidade
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
    marginBottom: spacing.xxxl,
  },
  socialContainer: {
    gap: spacing.md,
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
  errorMessage: {
    color: colors.error,
    fontSize: fontSize.sm,
    marginTop: spacing.md,
    fontWeight: '500',
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
