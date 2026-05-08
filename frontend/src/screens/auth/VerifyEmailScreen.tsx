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

import { Button, InfoCard, Input, ScreenHeader } from '@components';
import { colors } from '@constants/colors';
import { fontSize, spacing } from '@constants/design';
import { useAuth } from '@hooks/useAuth';
import { AuthBackground, authPanelStyle } from './authLayout';

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
      Alert.alert('Campo obrigatório', 'Informe o e-mail.');
      return;
    }

    const result = await resendVerificationEmail(email.trim().toLowerCase());

    if (!result.success) {
      Alert.alert('Erro', result.error || 'Não foi possível reenviar.');
      return;
    }

    setSentEmail(email);
    Alert.alert('Código enviado', 'Verifique seu e-mail.');
  };

  const handleVerify = async () => {
    if (!token.trim()) {
      Alert.alert('Campo obrigatório', 'Informe o código.');
      return;
    }

    const result = await verifyEmail(token.trim());

    if (!result.success) {
      Alert.alert('Erro', result.error || 'Falha ao verificar.');
      return;
    }

    clearError();

    Alert.alert('Sucesso', 'E-mail verificado.', [
      {
        text: 'Ir para login',
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
        <ScreenHeader onBack={() => navigation.goBack()} title="" />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.innerContent}>
            <View style={styles.hero}>
              <Text style={styles.title}>Verificar e-mail</Text>
              <Text style={styles.subtitle}>
                Enviamos um código para seu e-mail. Insira abaixo para continuar.
              </Text>
            </View>

            {sentEmail ? (
              <InfoCard title="Código enviado" tone="success" style={styles.feedbackCard}>
                <Text style={styles.feedbackText}>
                  Enviado para {sentEmail}
                </Text>
              </InfoCard>
            ) : null}

            <View style={styles.card}>
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
                onPress={handleResend}
                loading={isLoading}
                disabled={isLoading || !email.trim()}
                fullWidth
                size="large"
                style={styles.button}
              />

              <View style={styles.divider} />

              <Input
                label="Código de verificação"
                placeholder="Digite o código"
                value={token}
                onChangeText={setToken}
                editable={!isLoading}
              />

              <Button
                label="Confirmar e-mail"
                onPress={handleVerify}
                loading={isLoading}
                disabled={isLoading || !token.trim()}
                fullWidth
                size="large"
                style={styles.button}
              />
            </View>
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
    maxWidth: 420,
    alignSelf: 'center',
    width: '100%',
  },

  hero: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  title: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    marginTop: spacing.sm,
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

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },

  button: {
    marginTop: spacing.md,
    borderRadius: 999,
  },
});
