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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors } from '@constants/colors';
import { spacing, fontSize, componentSizes } from '@constants/design';

/**
 * SettingsDeleteAccount - Sub-tela de Excluir Conta
 * Tela 05 - Zona de Perigo
 * Exclusão permanente com dupla confirmação
 */

export default function SettingsDeleteAccountScreen() {
  const navigation = useNavigation<any>();
  const [confirmationText, setConfirmationText] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // Reset state when screen is focused
      setConfirmationText('');
      setPassword('');
    }, []),
  );

  const isValidConfirmation =
    confirmationText.toUpperCase() === 'EXCLUIR' && password.length > 0;

  const handleDeleteAccount = () => {
    if (!isValidConfirmation) {
      Alert.alert('Dados incompletos', 'Digite EXCLUIR e sua senha para continuar');
      return;
    }

    Alert.alert(
      '⚠️ Atenção!',
      'Esta ação é IRREVERSÍVEL. Todos seus dados serão deletados permanentemente e não poderão ser recuperados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Entendo, excluir',
          onPress: () => {
            Alert.alert(
              '✓ Conta excluída',
              'Sua conta foi excluída permanentemente.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    // Navigate to login
                    navigation.popToTop();
                  },
                },
              ],
            );
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
            <Text style={styles.backIcon}>←</Text>
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
        {/* Warning Box */}
        <View style={styles.warningBox}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningTitle}>Ação Permanente</Text>
          <Text style={styles.warningText}>
            Esta ação é irreversível. A exclusão de conta é permanente e todos os seus dados serão deletados, incluindo:
          </Text>
          <View style={styles.warningList}>
            <Text style={styles.warningItem}>• Perfil e dados pessoais</Text>
            <Text style={styles.warningItem}>• Posts e comentários</Text>
            <Text style={styles.warningItem}>• Favoritos e histórico</Text>
            <Text style={styles.warningItem}>• Agendamentos e reservas</Text>
            <Text style={styles.warningItem}>• Toda atividade do app</Text>
          </View>
        </View>

        {/* LGPD Compliance */}
        <View style={styles.complianceBox}>
          <Text style={styles.complianceIcon}>✓</Text>
          <Text style={styles.complianceTitle}>Conformidade LGPD</Text>
          <Text style={styles.complianceText}>
            Sua exclusão será processada de acordo com a Lei Geral de Proteção de Dados (LGPD). Todos os dados serão removidos de nossos servidores em até 30 dias.
          </Text>
        </View>

        {/* Confirmation Fields */}
        <View style={styles.formGroup}>
          <Text style={styles.formTitle}>Para continuar, confirme sua ação:</Text>

          {/* Confirmation Text Field */}
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
                  ? '✓ Confirmado'
                  : '✗ Deve ser exatamente "EXCLUIR"'}
              </Text>
            )}
          </View>

          {/* Password Field */}
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Sua Senha</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.fieldInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Digite sua senha"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={[
            styles.deleteButton,
            !isValidConfirmation && styles.deleteButtonDisabled,
          ]}
          onPress={handleDeleteAccount}
          disabled={!isValidConfirmation}
        >
          <Text style={styles.deleteButtonText}>
            {isValidConfirmation
              ? 'Excluir Minha Conta Definitivamente'
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
    fontSize: 18,
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
  },
});
