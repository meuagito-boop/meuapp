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
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors } from '@constants/colors';
import { spacing, fontSize, componentSizes } from '@constants/design';

/**
 * SettingsMyAccount - Sub-tela de Minha Conta
 * Tela 02 de T_CONFIG
 * Edita: Foto, Nome, Username, Bio, E-mail, Telefone
 */

interface AccountData {
  avatar: string;
  name: string;
  username: string;
  bio: string;
  email: string;
  phone: string;
}

export default function SettingsMyAccountScreen() {
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [account, setAccount] = useState<AccountData>({
    avatar: '👤',
    name: 'João Silva',
    username: 'joao.silva',
    bio: 'Descobrindo os melhores lugares da cidade 🌆',
    email: 'joao@example.com',
    phone: '(11) 98765-4321',
  });

  useFocusEffect(
    useCallback(() => {
      // Load account data
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 300);
    }, []),
  );

  const handleFieldChange = (field: keyof AccountData, value: string) => {
    setAccount((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleChangePhoto = () => {
    Alert.alert('Alterar Foto', 'Funcionalidade de câmera/galeria', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Câmera', onPress: () => {} },
      { text: 'Galeria', onPress: () => {} },
    ]);
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert('✓ Perfil salvo com sucesso');
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minha Conta</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!hasChanges || isSaving}
        >
          <Text
            style={[
              styles.headerAction,
              (!hasChanges || isSaving) && styles.headerActionDisabled,
            ]}
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={handleChangePhoto}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{account.avatar}</Text>
            </View>
            <Text style={styles.avatarEditLabel}>Editar foto</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formGroup}>
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Nome</Text>
            <TextInput
              style={styles.fieldInput}
              value={account.name}
              onChangeText={(text) => handleFieldChange('name', text)}
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Username</Text>
            <TextInput
              style={styles.fieldInput}
              value={account.username}
              onChangeText={(text) => handleFieldChange('username', text)}
              placeholderTextColor={colors.textTertiary}
            />
            <Text style={styles.fieldHint}>Seu identificador único no app</Text>
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Bio</Text>
            <TextInput
              style={[styles.fieldInput, styles.bioInput]}
              value={account.bio}
              onChangeText={(text) => handleFieldChange('bio', text)}
              multiline
              numberOfLines={3}
              placeholderTextColor={colors.textTertiary}
            />
            <Text style={styles.fieldHint}>
              {account.bio.length}/150 caracteres
            </Text>
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>E-mail</Text>
            <TextInput
              style={styles.fieldInput}
              value={account.email}
              onChangeText={(text) => handleFieldChange('email', text)}
              keyboardType="email-address"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Telefone</Text>
            <TextInput
              style={styles.fieldInput}
              value={account.phone}
              onChangeText={(text) => handleFieldChange('phone', text)}
              keyboardType="phone-pad"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerAction: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '700',
  },
  headerActionDisabled: {
    color: colors.textTertiary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarButton: {
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarText: {
    fontSize: 28,
  },
  avatarEditLabel: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '700',
  },
  formGroup: {
    paddingHorizontal: spacing.md,
  },
  formField: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
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
    marginBottom: spacing.xs,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  fieldHint: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
});
