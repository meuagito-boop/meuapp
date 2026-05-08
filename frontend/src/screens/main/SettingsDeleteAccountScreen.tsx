import { CommonActions, useFocusEffect, useNavigation, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';

import { useAuth } from '@hooks/useAuth';
import { userStore } from '@stores/userStore';
import { colors } from '@constants/colors';
import { spacing, fontSize } from '@constants/design';
import { Button, InfoCard, ScreenHeader } from '@components';

/**
 * SettingsDeleteAccount - Sub-tela de Excluir Conta
 */

export default function SettingsDeleteAccountScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const { logout } = useAuth();
  const deleteAccount = userStore((state) => state.deleteAccount);
  const clearUserError = userStore((state) => state.clearError);

  const [confirmationText, setConfirmationText] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setConfirmationText('');
      setPassword('');
      setRequestError(null);
      clearUserError();
    }, [clearUserError]),
  );

  const isValidConfirmation =
    confirmationText.toUpperCase() === 'EXCLUIR' && password.length > 0;

  const executeDeleteAccount = async () => {
    setIsSubmitting(true);
    setRequestError(null);

    try {
      await deleteAccount(password);
      await logout();

      Alert.alert('Conta excluida', 'Sua conta foi excluida permanentemente.', [
        {
          text: 'OK',
          onPress: () => {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              }),
            );
          },
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao excluir conta. Tente novamente.';
      setRequestError(message);
      Alert.alert('Erro', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = () => {
    if (!isValidConfirmation) {
      Alert.alert('Dados incompletos', 'Digite EXCLUIR e sua senha para continuar');
      return;
    }

    Alert.alert(
      'Atencao',
      'Esta acao e irreversivel. Todos os seus dados serao deletados permanentemente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Entendo, excluir',
          onPress: () => {
            void executeDeleteAccount();
          },
          style: 'destructive',
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Excluir Conta" onBack={() => navigation.goBack()} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <InfoCard title="Acao critica" tone="danger">
          <Text style={styles.warningText}>
            Ao confirmar, sua conta sera marcada como excluida, suas sessoes serao encerradas e
            voce perdera acesso ao app com este usuario.
          </Text>
          <View style={styles.warningList}>
            <Text style={styles.warningItem}>- Perfil deixa de ficar acessivel</Text>
            <Text style={styles.warningItem}>- Tokens e sessoes sao removidos</Text>
            <Text style={styles.warningItem}>- Conteudos ligados a conta deixam de aparecer nos fluxos reais</Text>
            <Text style={styles.warningItem}>- Uma nova entrada exigira outro cadastro ou suporte</Text>
          </View>
        </InfoCard>

        <InfoCard title="Privacidade e seguranca" tone="brand">
          <Text style={styles.complianceText}>
            Use esta tela apenas se quiser encerrar o acesso a esta conta. O processamento dos
            dados segue a Politica de Privacidade e as regras de seguranca do Meu Agito.
          </Text>
        </InfoCard>

        <View style={styles.formGroup}>
          <Text style={styles.formTitle}>Para continuar, confirme sua acao:</Text>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>
              Digite a palavra <Text style={styles.fieldLabelBold}>EXCLUIR</Text>
            </Text>
            <TextInput
              style={styles.fieldInput}
              value={confirmationText}
              onChangeText={setConfirmationText}
              placeholder="EXCLUIR"
              placeholderTextColor={colors.textTertiary}
              maxLength={10}
              editable={!isSubmitting}
            />
            {confirmationText && (
              <Text
                style={[
                  styles.fieldHint,
                  confirmationText.toUpperCase() === 'EXCLUIR'
                    ? styles.fieldHintValid
                    : styles.fieldHintInvalid,
                ]}
              >
                {confirmationText.toUpperCase() === 'EXCLUIR'
                  ? 'Confirmado'
                  : 'Deve ser exatamente "EXCLUIR"'}
              </Text>
            )}
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Sua senha</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.fieldInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Digite sua senha"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry={!showPassword}
                editable={!isSubmitting}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
              >
                <Text style={styles.eyeIcon}>{showPassword ? 'VER' : 'OCULTAR'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {requestError ? <Text style={styles.errorText}>{requestError}</Text> : null}

        <Button
          label={
            isSubmitting
              ? 'Excluindo conta...'
              : isValidConfirmation
                ? 'Excluir minha conta'
                : 'Preencha os campos acima'
          }
          variant="danger"
          onPress={handleDeleteAccount}
          disabled={!isValidConfirmation || isSubmitting}
          loading={isSubmitting}
          fullWidth
          size="large"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.lg,
  },
  warningText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  warningList: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  warningItem: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  complianceText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  formGroup: {
    gap: spacing.lg,
  },
  formTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  formField: {
    gap: spacing.sm,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  fieldLabelBold: {
    fontWeight: '600',
    color: '#E74C3C',
  },
  fieldInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
  },
  fieldHint: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  fieldHintValid: {
    color: '#27AE60',
  },
  fieldHintInvalid: {
    color: '#E74C3C',
  },
  passwordInputContainer: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
  },
  eyeIcon: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
