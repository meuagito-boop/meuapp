import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, ParamListBase, RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button, InfoCard, Input, ScreenHeader, SectionLabel } from '@components';
import { colors } from '@constants/colors';
import { fontSize, spacing } from '@constants/design';
import { useAuth } from '@hooks/useAuth';

type ForgotPasswordRouteParams = {
  token?: string;
};

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<ParamListBase, string>>();
  const { requestPasswordReset, resetPassword, isLoading, clearError } = useAuth();
  const routeToken = useMemo(() => {
    const params = route.params as ForgotPasswordRouteParams | undefined;
    return typeof params?.token === 'string' ? params.token.trim() : '';
  }, [route.params]);

  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sentEmail, setSentEmail] = useState('');

  useEffect(() => {
    if (routeToken.length > 0) {
      setToken(routeToken);
    }
  }, [routeToken]);

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert('Campo obrigatorio', 'Informe o e-mail da conta.');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const result = await requestPasswordReset(normalizedEmail);
    if (!result.success) {
      Alert.alert('Erro', result.error || 'Nao foi possivel enviar o codigo de recuperacao.');
      return;
    }

    setSentEmail(normalizedEmail);
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
      <ScreenHeader title="Recuperar senha" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Redefina seu acesso</Text>
        <Text style={styles.subtitle}>
          Solicite o codigo por e-mail e depois use esse codigo para criar uma nova senha.
        </Text>

        {sentEmail ? (
          <InfoCard title="E-mail enviado" tone="success" style={styles.feedbackCard}>
            <Text style={styles.feedbackText}>
              Enviamos as instrucoes para {sentEmail}. Verifique sua caixa de entrada.
            </Text>
          </InfoCard>
        ) : null}

        <SectionLabel label="Solicitar codigo" style={styles.sectionLabel} />
        <View style={styles.section}>
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
            disabled={isLoading || !email.trim()}
            fullWidth
            size="large"
            style={styles.primaryButton}
          />
        </View>

        <SectionLabel label="Redefinir senha" style={styles.sectionLabel} />
        <View style={styles.section}>
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
            disabled={
              isLoading || !token.trim() || !newPassword || !confirmPassword
            }
            fullWidth
            size="large"
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
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
  feedbackCard: {
    marginBottom: spacing.lg,
  },
  feedbackText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  sectionLabel: {
    paddingHorizontal: 0,
    paddingTop: spacing.md,
  },
  section: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  primaryButton: {
    marginTop: spacing.sm,
  },
});
