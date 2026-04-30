import React, { useState } from 'react';
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
import { useNavigation, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button, Input } from '@components';
import { colors } from '@constants/colors';
import { fontSize, spacing } from '@constants/design';
import { useAuth } from '@hooks/useAuth';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const { requestPasswordReset, resetPassword, isLoading, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert('Campo obrigatorio', 'Informe o e-mail da conta.');
      return;
    }

    const result = await requestPasswordReset(email.trim().toLowerCase());
    if (!result.success) {
      Alert.alert('Erro', result.error || 'Nao foi possivel enviar o codigo de recuperacao.');
      return;
    }

    Alert.alert('Codigo enviado', 'Verifique seu e-mail. Cole o codigo de validacao abaixo para redefinir a senha.');
  };

  const handleResetPassword = async () => {
    if (!token.trim()) {
      Alert.alert('Campo obrigatorio', 'Informe o codigo recebido por e-mail.');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Senha invalida', 'A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Senha invalida', 'As senhas nao coincidem.');
      return;
    }

    const result = await resetPassword(token.trim(), newPassword);
    if (!result.success) {
      Alert.alert('Erro', result.error || 'Nao foi possivel redefinir a senha.');
      return;
    }

    clearError();
    Alert.alert('Senha alterada', 'Sua senha foi redefinida com sucesso.', [
      {
        text: 'Voltar ao login',
        onPress: () => navigation.navigate('Login' as never),
      },
    ]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Recuperar senha</Text>
        <Text style={styles.subtitle}>
          Solicite o codigo por e-mail e depois use esse codigo para criar uma nova senha.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Solicitar codigo</Text>
          <Input
            label="E-mail"
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />

          <Button
            label="Enviar codigo por e-mail"
            onPress={handleSendCode}
            loading={isLoading}
            fullWidth
            style={styles.primaryButton}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Redefinir senha</Text>
          <Input
            label="Codigo de validacao"
            placeholder="Cole o codigo recebido"
            value={token}
            onChangeText={setToken}
            autoCapitalize="none"
            editable={!isLoading}
          />

          <Input
            label="Nova senha"
            placeholder="********"
            value={newPassword}
            onChangeText={setNewPassword}
            isPassword
            editable={!isLoading}
          />

          <Input
            label="Confirmar nova senha"
            placeholder="********"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            isPassword
            editable={!isLoading}
          />

          <Button
            label="Redefinir senha"
            onPress={handleResetPassword}
            loading={isLoading}
            fullWidth
            style={styles.primaryButton}
          />
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
  content: {
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
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  section: {
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  primaryButton: {
    marginTop: spacing.sm,
  },
});
