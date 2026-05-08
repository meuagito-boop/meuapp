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
import { AuthBackground, authPanelStyle } from './authLayout';

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
      Alert.alert('Campo obrigatório', 'Informe o e-mail da conta.');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const result = await requestPasswordReset(normalizedEmail);

    if (!result.success) {
      Alert.alert('Erro', result.error || 'Não foi possível enviar o código.');
      return;
    }

    setSentEmail(normalizedEmail);
    Alert.alert('Código enviado', 'Verifique seu e-mail e use o código abaixo.');
  };

  const handleResetPassword = async () => {
    if (!token.trim()) {
      Alert.alert('Campo obrigatório', 'Informe o código.');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Senha inválida', 'Mínimo de 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    const result = await resetPassword(token.trim(), newPassword);

    if (!result.success) {
      Alert.alert('Erro', result.error || 'Não foi possível redefinir.');
      return;
    }

    clearError();

    Alert.alert('Sucesso', 'Senha redefinida.', [
      {
        text: 'Voltar ao login',
        onPress: () => navigation.navigate('Login' as never),
      },
    ]);
  };

  return (
    <AuthBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScreenHeader
          title=""
          onBack={() => navigation.goBack()}
        />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.innerContent}>

            <View style={styles.heroBlock}>
              <Text style={styles.title}>Redefinir senha</Text>
              <Text style={styles.subtitle}>
                Solicite um código e crie uma nova senha com segurança.
              </Text>
            </View>

            {sentEmail ? (
              <InfoCard title="E-mail enviado" tone="success" style={styles.feedbackCard}>
                <Text style={styles.feedbackText}>
                  Enviamos para {sentEmail}. Verifique sua caixa de entrada.
                </Text>
              </InfoCard>
            ) : null}

            <View style={styles.card}>
              <SectionLabel label="Solicitar código" style={styles.sectionLabel} />

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
                  label="Enviar código"
                  onPress={handleSendCode}
                  loading={isLoading}
                  disabled={isLoading || !email.trim()}
                  fullWidth
                  size="large"
                  style={styles.primaryButton}
                />
              </View>

              <View style={styles.divider} />

              <SectionLabel label="Nova senha" style={styles.sectionLabel} />

              <View style={styles.section}>
                <Input
                  label="Código"
                  placeholder="Código recebido"
                  value={token}
                  onChangeText={setToken}
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
                  label="Confirmar senha"
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
                  disabled={isLoading || !token || !newPassword || !confirmPassword}
                  fullWidth
                  size="large"
                  style={styles.primaryButton}
                />
              </View>
            </View>

            <Text style={styles.helperText}>
              Use uma senha forte com pelo menos 8 caracteres.
            </Text>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },

  innerContent: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },

  heroBlock: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  title: {
    fontSize: 30,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },

  feedbackCard: {
    marginBottom: spacing.lg,
  },

  feedbackText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },

  card: {
    ...authPanelStyle,
    borderRadius: 24,
  },

  sectionLabel: {
    paddingHorizontal: 0,
    paddingTop: spacing.md,
  },

  section: {
    width: '100%',
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },

  primaryButton: {
    marginTop: spacing.md,
    borderRadius: 999,
  },

  helperText: {
    marginTop: spacing.xl,
    textAlign: 'center',
    color: colors.textTertiary,
    fontSize: fontSize.xs,
  },
});
