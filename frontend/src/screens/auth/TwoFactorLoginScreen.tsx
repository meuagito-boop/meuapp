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
import { fontSize, spacing } from '@constants/design';
import { useAuth } from '@hooks/useAuth';

export default function TwoFactorLoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const {
    loginWith2FA,
    clearTwoFactorChallenge,
    clearError,
    error,
    isLoading,
    require2FA,
    tempEmail,
  } = useAuth();

  const [code, setCode] = useState('');

  useEffect(() => {
    if (!require2FA) {
      navigation.replace('Login' as never);
    }
  }, [navigation, require2FA]);

  const handleSubmit = async () => {
    const normalizedCode = code.trim();
    if (!/^\d{6}$/.test(normalizedCode)) {
      Alert.alert('Codigo invalido', 'Informe o codigo de 6 digitos do autenticador.');
      return;
    }

    try {
      await loginWith2FA(normalizedCode);
      clearError();
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : error || 'Nao foi possivel validar o codigo 2FA.';
      Alert.alert('Falha ao validar 2FA', message);
      setCode('');
    }
  };

  const handleCancel = () => {
    clearTwoFactorChallenge();
    navigation.replace('Login' as never);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Text style={styles.backText}>Voltar ao login</Text>
        </TouchableOpacity>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>2FA</Text>
        </View>

        <Text style={styles.title}>Confirme sua autenticacao</Text>
        <Text style={styles.subtitle}>
          Digite o codigo gerado no aplicativo autenticador para concluir o acesso da conta
          {tempEmail ? ` ${tempEmail}.` : '.'}
        </Text>

        <View style={styles.card}>
          <Input
            label="Codigo 2FA"
            placeholder="000000"
            value={code}
            onChangeText={(value) => {
              const numericValue = value.replace(/\D/g, '').slice(0, 6);
              setCode(numericValue);
            }}
            keyboardType="number-pad"
            maxLength={6}
            editable={!isLoading}
          />

          {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

          <Button
            label="Validar codigo"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={code.trim().length !== 6}
            fullWidth
            style={styles.primaryButton}
          />

          <Button
            label="Cancelar desafio"
            onPress={handleCancel}
            variant="ghost"
            disabled={isLoading}
            fullWidth
            style={styles.secondaryButton}
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
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.lg,
  },
  badgeText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  title: {
    color: colors.text,
    fontSize: fontSize.huge,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  errorMessage: {
    color: colors.error,
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  primaryButton: {
    marginTop: spacing.sm,
  },
  secondaryButton: {
    marginTop: spacing.md,
  },
});
