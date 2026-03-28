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
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@hooks/useAuth';
import { Button, Input } from '@components';
import { colors } from '@constants/colors';
import { spacing, fontSize } from '@constants/design';

/**
 * SignUpScreen - T03c Design Aprovado
 * Completo registro com validação de força de senha, termos obrigatórios (LGPD)
 */
export default function SignUpScreen() {
  const navigation = useNavigation();
  const { signup, error, clearError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (text: string) => {
    setName(text);
    if (text && text.length < 3) {
      setNameError('Nome deve ter pelo menos 3 caracteres');
    } else {
      setNameError('');
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (text && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
      setEmailError('Digite um e-mail válido');
    } else {
      setEmailError('');
    }
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 'fraca';
    const hasNumber = /\d/.test(pwd);
    const hasSymbol = /[!@#$%^&*]/.test(pwd);
    const hasLength = pwd.length >= 12;
    if (hasLength && hasNumber && hasSymbol) return 'forte';
    if (pwd.length >= 10 && (hasNumber || hasSymbol)) return 'média';
    return 'fraca';
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (text && text.length < 8) {
      setPasswordError('A senha deve ter pelo menos 8 caracteres');
    } else if (confirmPassword && text !== confirmPassword) {
      setConfirmError('As senhas não coincidem');
    } else {
      setPasswordError('');
      setConfirmError('');
    }
    if (error) clearError();
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
    if (!name.trim() || nameError || name.length < 3) {
      setNameError('Nome válido é obrigatório');
      return;
    }
    if (!email.trim() || emailError) {
      setEmailError('E-mail válido é obrigatório');
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
    const result = await signup(email, name, password);

    if (!result.success) {
      Alert.alert('Erro', result.error || 'Erro ao criar conta');
    } else {
      Alert.alert('Sucesso', 'Verifique seu e-mail para ativar a conta');
      navigation.navigate('Login' as never);
    }
    setIsSubmitting(false);
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColor = passwordStrength === 'forte' ? colors.success : passwordStrength === 'média' ? colors.warning : colors.error;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>Preencha os dados abaixo para se cadastrar</Text>

        <View style={{ marginTop: spacing.xxl }}>
          <Input label="Nome completo" placeholder="Seu nome" value={name} onChangeText={handleNameChange} editable={!isSubmitting} error={nameError} />
          <Input label="Email" placeholder="seu@email.com" value={email} onChangeText={handleEmailChange} keyboardType="email-address" autoCapitalize="none" editable={!isSubmitting} error={emailError} />
          <Input label="Senha" placeholder="••••••••" value={password} onChangeText={handlePasswordChange} isPassword editable={!isSubmitting} error={passwordError} />

          {password && (
            <View style={styles.strengthContainer}>
              <View style={[styles.strengthBar, { backgroundColor: strengthColor }]} />
              <Text style={[{ color: strengthColor }, { fontSize: fontSize.sm }]}>
                Força: {passwordStrength === 'forte' ? 'Forte' : passwordStrength === 'média' ? 'Média' : 'Fraca'}
              </Text>
            </View>
          )}

          <Input label="Confirmar senha" placeholder="••••••••" value={confirmPassword} onChangeText={handleConfirmChange} isPassword editable={!isSubmitting} error={confirmError} />

          <TouchableOpacity onPress={() => setTermsAccepted(!termsAccepted)} style={styles.checkboxContainer}>
            <View style={[styles.checkbox, termsAccepted && { backgroundColor: colors.primary }]}>
              {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxText}>
              Concordo com os <Text style={styles.link} onPress={() => Alert.alert('Termos')}>Termos de Uso</Text> e <Text style={styles.link} onPress={() => Alert.alert('Privacidade')}>Política de Privacidade</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.errorMessage}>{error}</Text>}

        <Button label="Criar conta" onPress={handleSignUp} disabled={isSubmitting || !termsAccepted || !!nameError || !!emailError || !!passwordError} loading={isSubmitting} fullWidth style={{ marginTop: spacing.xl }} />

        <TouchableOpacity onPress={() => navigation.navigate('Login' as never)} style={{ marginTop: spacing.xl, marginBottom: spacing.xxxl }}>
          <Text style={styles.footerText}>
            Já tem conta? <Text style={styles.link}>Faça login</Text>
          </Text>
        </TouchableOpacity>
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
    fontSize: fontSize.sm,
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
