import { useFocusEffect, useNavigation, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { HeaderBackButton } from '@components';
import { colors } from '@constants/colors';
import { spacing, fontSize } from '@constants/design';
import { userStore, type UserProfile } from '@stores/userStore';

interface AccountData {
  avatar?: string;
  name: string;
  username: string;
  bio: string;
  email: string;
  phoneNumber: string;
}

const EMPTY_ACCOUNT: AccountData = {
  avatar: undefined,
  name: '',
  username: '',
  bio: '',
  email: '',
  phoneNumber: '',
};

const mapProfileToAccount = (profile: UserProfile | null | undefined): AccountData => ({
  avatar: profile?.avatar || undefined,
  name: profile?.name || '',
  username: profile?.username || '',
  bio: profile?.bio || '',
  email: profile?.email || '',
  phoneNumber: profile?.phoneNumber || '',
});

const getInitials = (name: string, email: string) => {
  const source = name.trim().length > 0 ? name : email;
  const initials = source
    .split(/[.\s@_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return initials || 'US';
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export default function SettingsMyAccountScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const getProfile = userStore((state) => state.getProfile);
  const updateAccount = userStore((state) => state.updateAccount);
  const updateProfile = userStore((state) => state.updateProfile);
  const uploadAvatar = userStore((state) => state.uploadAvatar);
  const clearUserError = userStore((state) => state.clearError);

  const [account, setAccount] = useState<AccountData>(EMPTY_ACCOUNT);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadProfile = async () => {
        setIsLoading(true);
        setRequestError(null);
        clearUserError();

        try {
          const profile = await getProfile();
          if (!isActive) {
            return;
          }

          setAccount(mapProfileToAccount(profile));
          setHasChanges(false);
        } catch (error) {
          if (isActive) {
            setRequestError(getErrorMessage(error, 'Nao foi possivel carregar sua conta.'));
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      };

      void loadProfile();

      return () => {
        isActive = false;
      };
    }, [clearUserError, getProfile])
  );

  const handleFieldChange = (field: keyof AccountData, value: string) => {
    setAccount((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const validateBeforeSave = () => {
    if (account.name.trim().length < 3) {
      Alert.alert('Nome invalido', 'Informe um nome com pelo menos 3 caracteres.');
      return false;
    }

    if (account.email.trim().length === 0 || !account.email.includes('@')) {
      Alert.alert('Email invalido', 'Informe um email valido.');
      return false;
    }

    if (account.username.trim().length > 0 && account.username.trim().length < 3) {
      Alert.alert('Username invalido', 'Use pelo menos 3 caracteres ou deixe o campo vazio.');
      return false;
    }

    if (account.bio.length > 150) {
      Alert.alert('Bio muito longa', 'A bio deve ter no maximo 150 caracteres.');
      return false;
    }

    return true;
  };

  const handleChangePhoto = async () => {
    setRequestError(null);
    clearUserError();

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permissao negada', 'Autorize o acesso a galeria para alterar sua foto.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (result.canceled || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      const filename = asset.fileName || `avatar-${Date.now()}.jpg`;
      const mimeType = asset.mimeType || 'image/jpeg';

      setIsUploadingAvatar(true);
      const updatedProfile = await uploadAvatar(asset.uri, filename, mimeType);
      setAccount((current) => ({
        ...current,
        avatar: updatedProfile.avatar || current.avatar,
      }));
      Alert.alert('Foto atualizada', 'Sua foto foi enviada com sucesso.');
    } catch (error) {
      const message = getErrorMessage(error, 'Nao foi possivel atualizar a foto.');
      setRequestError(message);
      Alert.alert('Erro ao atualizar foto', message);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!hasChanges || isSaving || isUploadingAvatar) {
      return;
    }

    if (!validateBeforeSave()) {
      return;
    }

    setIsSaving(true);
    setRequestError(null);
    clearUserError();

    try {
      await updateAccount({
        name: account.name.trim(),
        email: account.email.trim().toLowerCase(),
        username: account.username.trim().length > 0 ? account.username.trim() : null,
        phoneNumber: account.phoneNumber.trim().length > 0 ? account.phoneNumber.trim() : null,
      });

      await updateProfile({
        bio: account.bio.trim(),
      });

      const refreshedProfile = await getProfile();
      setAccount(mapProfileToAccount(refreshedProfile));
      setHasChanges(false);
      Alert.alert('Perfil salvo', 'Suas informacoes foram atualizadas.');
    } catch (error) {
      const message = getErrorMessage(error, 'Erro ao salvar conta. Tente novamente.');
      setRequestError(message);
      Alert.alert('Erro ao salvar', message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando sua conta...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const initials = getInitials(account.name, account.email);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <HeaderBackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Minha Conta</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!hasChanges || isSaving || isUploadingAvatar}
        >
          <Text
            style={[
              styles.headerAction,
              (!hasChanges || isSaving || isUploadingAvatar) && styles.headerActionDisabled,
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
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={handleChangePhoto}
            disabled={isSaving || isUploadingAvatar}
          >
            <View style={styles.avatar}>
              {account.avatar ? (
                <Image source={{ uri: account.avatar }} resizeMode="cover" style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </View>
            <Text style={styles.avatarEditLabel}>
              {isUploadingAvatar ? 'Enviando...' : 'Alterar foto'}
            </Text>
          </TouchableOpacity>
        </View>

        {requestError ? <Text style={styles.errorText}>{requestError}</Text> : null}

        <View style={styles.formGroup}>
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Nome</Text>
            <TextInput
              style={styles.fieldInput}
              value={account.name}
              onChangeText={(text) => handleFieldChange('name', text)}
              placeholder="Seu nome"
              placeholderTextColor={colors.textTertiary}
              editable={!isSaving}
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Username</Text>
            <TextInput
              style={styles.fieldInput}
              value={account.username}
              onChangeText={(text) => handleFieldChange('username', text)}
              placeholder="seu.usuario"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="none"
              editable={!isSaving}
            />
            <Text style={styles.fieldHint}>Identificador publico do perfil.</Text>
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Bio</Text>
            <TextInput
              style={[styles.fieldInput, styles.bioInput]}
              value={account.bio}
              onChangeText={(text) => handleFieldChange('bio', text)}
              placeholder="Conte um pouco sobre voce"
              placeholderTextColor={colors.textTertiary}
              multiline
              maxLength={150}
              editable={!isSaving}
            />
            <Text style={styles.fieldHint}>{account.bio.length}/150 caracteres</Text>
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={styles.fieldInput}
              value={account.email}
              onChangeText={(text) => handleFieldChange('email', text)}
              placeholder="email@exemplo.com"
              placeholderTextColor={colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isSaving}
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Telefone</Text>
            <TextInput
              style={styles.fieldInput}
              value={account.phoneNumber}
              onChangeText={(text) => handleFieldChange('phoneNumber', text)}
              placeholder="+55 11 99999-9999"
              placeholderTextColor={colors.textTertiary}
              keyboardType="phone-pad"
              editable={!isSaving}
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
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  headerAction: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
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
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  avatarEditLabel: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    lineHeight: 18,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  formGroup: {
    paddingHorizontal: spacing.md,
  },
  formField: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
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
