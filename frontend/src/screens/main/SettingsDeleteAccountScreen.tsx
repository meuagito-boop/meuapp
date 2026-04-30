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
      await deleteAccount();
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.backButton}>
            <Text style={styles.backIcon}>{'<'}</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Excluir Conta</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.warningBox}>
          <Text style={styles.warningIcon}>WARN</Text>
          <Text style={styles.warningTitle}>Acao Permanente</Text>
          <Text style={styles.warningText}>
            Esta acao e irreversivel. A exclusao de conta e permanente e todos os seus dados serao deletados, incluindo:
          </Text>
          <View style={styles.warningList}>
            <Text style={styles.warningItem}>- Perfil e dados pessoais</Text>
            <Text style={styles.warningItem}>- Posts e comentarios</Text>
            <Text style={styles.warningItem}>- Favoritos e historico</Text>
            <Text style={styles.warningItem}>- Agendamentos e reservas</Text>
            <Text style={styles.warningItem}>- Toda atividade no app</Text>
          </View>
        </View>

        <View style={styles.complianceBox}>
          <Text style={styles.complianceIcon}>OK</Text>
          <Text style={styles.complianceTitle}>Conformidade LGPD</Text>
          <Text style={styles.complianceText}>
            Sua exclusao sera processada de acordo com a Lei Geral de Protecao de Dados (LGPD).
          </Text>
        </View>

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

        <TouchableOpacity
          style={[
            styles.deleteButton,
            (!isValidConfirmation || isSubmitting) && styles.deleteButtonDisabled,
          ]}
          onPress={handleDeleteAccount}
          disabled={!isValidConfirmation || isSubmitting}
        >
          <Text style={styles.deleteButtonText}>
            {isSubmitting
              ? 'Excluindo conta...'
              : isValidConfirmation
                ? 'Excluir minha conta definitivamente'
                : 'Preencha os campos acima'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 15,
    color: colors.text,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.lg,
    fontWeight: '900',
    color: colors.text,
  },
  headerSpacer: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.lg,
  },
  warningBox: {
    backgroundColor: 'rgba(231, 76, 60, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.25)',
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.md,
  },
  warningIcon: {
    fontSize: 24,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  warningTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#E74C3C',
    textAlign: 'center',
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
  complianceBox: {
    backgroundColor: 'rgba(39, 174, 96, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(39, 174, 96, 0.25)',
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.md,
  },
  complianceIcon: {
    fontSize: 20,
    color: '#27AE60',
    alignSelf: 'center',
  },
  complianceTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
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
    fontWeight: '700',
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
    fontWeight: '700',
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
    fontWeight: '700',
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  deleteButton: {
    paddingVertical: spacing.lg,
    borderRadius: 12,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  deleteButtonDisabled: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deleteButtonText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
});
