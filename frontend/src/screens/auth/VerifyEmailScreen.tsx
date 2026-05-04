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

type VerifyEmailRouteParams = {
  token?: string;
};

export default function VerifyEmailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<ParamListBase, string>>();
  const { verifyEmail, resendVerificationEmail, isLoading, clearError } = useAuth();
  const routeToken = useMemo(() => {
    const params = route.params as VerifyEmailRouteParams | undefined;
    return typeof params?.token === 'string' ? params.token.trim() : '';
  }, [route.params]);

  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [sentEmail, setSentEmail] = useState('');

  useEffect(() => {
    if (routeToken.length > 0) {
      setToken(routeToken);
    }
  }, [routeToken]);

  const handleResend = async () => {
    if (!email.trim()) {
      Alert.alert('Campo obrigatorio', 'Informe o e-mail para reenviar a verificacao.');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const result = await resendVerificationEmail(normalizedEmail);
    if (!result.success) {
      Alert.alert('Erro', result.error || 'Nao foi possivel reenviar o codigo.');
      return;
    }

    setSentEmail(normalizedEmail);
    Alert.alert('Codigo reenviado', 'Verifique sua caixa de e-mail.');
  };

  const handleVerify = async () => {
    if (!token.trim()) {
      Alert.alert('Campo obrigatorio', 'Informe o codigo de verificacao.');
      return;
    }

    const result = await verifyEmail(token.trim());
    if (!result.success) {
      Alert.alert('Erro', result.error || 'Nao foi possivel verificar o e-mail.');
      return;
    }

    clearError();
    Alert.alert('E-mail verificado', 'Seu e-mail foi confirmado com sucesso.', [
      {
        text: 'Ir para login',
        onPress: () => navigation.navigate('Login' as never),
      },
    ]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScreenHeader title="Verificar e-mail" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Confirme seu e-mail</Text>
        <Text style={styles.subtitle}>
          Reenvie o codigo para seu e-mail e cole o codigo de validacao recebido.
        </Text>

        {sentEmail ? (
          <InfoCard title="Codigo reenviado" tone="success" style={styles.feedbackCard}>
            <Text style={styles.feedbackText}>
              Enviamos um novo codigo para {sentEmail}. Confira sua caixa de entrada.
            </Text>
          </InfoCard>
        ) : null}

        <SectionLabel label="Reenviar codigo" style={styles.sectionLabel} />
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
            label="Reenviar codigo"
            onPress={handleResend}
            loading={isLoading}
            disabled={isLoading || !email.trim()}
            fullWidth
            size="large"
            style={styles.primaryButton}
          />
        </View>

        <SectionLabel label="Validar codigo" style={styles.sectionLabel} />
        <View style={styles.section}>
          <Input
            label="Codigo de validacao"
            placeholder="Cole o codigo recebido"
            value={token}
            onChangeText={setToken}
            autoCapitalize="none"
            editable={!isLoading}
          />

          <Button
            label="Confirmar e-mail"
            onPress={handleVerify}
            loading={isLoading}
            disabled={isLoading || !token.trim()}
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
