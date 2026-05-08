import * as ImagePicker from 'expo-image-picker';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button, ScreenHeader } from '@components';
import { colors } from '@constants/colors';
import { fontSize, spacing } from '@constants/design';
import GeolocationService from '@services/geolocation/GeolocationService';
import { userService } from '@services/api';
import { authStore } from '@stores/authStore';
import { userStore } from '@stores/userStore';
import { AuthBackground, authPanelStyle } from './authLayout';

type SetupStep = 1 | 2 | 3;

type UsernameStatus = 'idle' | 'checking' | 'available' | 'unavailable' | 'error';

const USERNAME_PATTERN = /^[a-zA-Z0-9._]{3,30}$/;

const normalizeUsername = (value: string) => value.trim().replace(/^@/, '').toLowerCase();

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const formatCityFromAddress = (
  address: Awaited<ReturnType<typeof GeolocationService.reverseGeocodeCoordinates>>[number],
) => {
  const city = address.city || address.subregion || address.district || address.name;
  const region = address.region;

  if (city && region) {
    return `${city}, ${region}`;
  }

  return city || region || '';
};

export default function PersonalSetupScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const completeOnboarding = authStore((state) => state.completeOnboarding);
  const updateAccount = userStore((state) => state.updateAccount);
  const updateProfile = userStore((state) => state.updateProfile);
  const uploadAvatar = userStore((state) => state.uploadAvatar);

  const [step, setStep] = useState<SetupStep>(1);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const usernameNormalized = normalizeUsername(username);
  const usernameValid = USERNAME_PATTERN.test(usernameNormalized);

  const canGoNext = useMemo(() => {
    if (step === 1) {
      return usernameValid && usernameStatus === 'available' && !isUploadingAvatar;
    }

    if (step === 2) {
      return city.trim().length > 1 && !isResolvingLocation;
    }

    return !isSaving;
  }, [city, isResolvingLocation, isSaving, isUploadingAvatar, step, usernameStatus, usernameValid]);

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setUsernameStatus('idle');
    setRequestError(null);
  };

  const checkUsername = async () => {
    if (!usernameValid) {
      setUsernameStatus('error');
      setRequestError('Use entre 3 e 30 caracteres: letras, números, ponto ou underscore.');
      return;
    }

    setUsernameStatus('checking');
    setRequestError(null);

    try {
      const result = await userService.checkUsernameAvailability(usernameNormalized);
      setUsernameStatus(result.available ? 'available' : 'unavailable');

      if (!result.available) {
        setRequestError('Este username já está em uso.');
      }
    } catch (error) {
      setUsernameStatus('error');
      setRequestError(getErrorMessage(error, 'Não foi possível verificar o username.'));
    }
  };

  const handleChangePhoto = async () => {
    setRequestError(null);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permissão negada', 'Autorize o acesso à galeria para enviar sua foto.');
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
      setAvatarUrl(updatedProfile.avatar || null);
    } catch (error) {
      const message = getErrorMessage(error, 'Não foi possível enviar sua foto.');
      setRequestError(message);
      Alert.alert('Erro ao enviar foto', message);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleUseGps = async () => {
    setIsResolvingLocation(true);
    setRequestError(null);

    try {
      const coordinates = await GeolocationService.getCurrentLocation();
      const addresses = await GeolocationService.reverseGeocodeCoordinates(
        coordinates.latitude,
        coordinates.longitude,
      );
      const resolvedCity = addresses[0] ? formatCityFromAddress(addresses[0]) : '';

      if (!resolvedCity) {
        throw new Error('Não foi possível identificar a cidade pela localização.');
      }

      setCity(resolvedCity);
    } catch (error) {
      const message = getErrorMessage(error, 'Não foi possível usar sua localização.');
      setRequestError(message);
      Alert.alert('Localização indisponível', message);
    } finally {
      setIsResolvingLocation(false);
    }
  };

  const handleNext = async () => {
    if (step < 3) {
      setStep((prev) => (prev + 1) as SetupStep);
      return;
    }

    setIsSaving(true);
    setRequestError(null);

    try {
      await updateAccount({
        username: usernameNormalized,
      });

      await updateProfile({
        bio: bio.trim(),
        location: city.trim(),
      });

      await completeOnboarding({ tab: 'Home' });
    } catch (error) {
      const message = getErrorMessage(error, 'Não foi possível finalizar seu perfil.');
      setRequestError(message);
      Alert.alert('Erro ao finalizar', message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      navigation.goBack();
      return;
    }

    setStep((prev) => (prev - 1) as SetupStep);
  };

  const usernameValidationText = useMemo(() => {
    if (!usernameNormalized) {
      return 'Use entre 3 e 30 caracteres.';
    }

    if (!usernameValid) {
      return 'Use apenas letras, números, ponto e underscore.';
    }

    if (usernameStatus === 'checking') {
      return 'Verificando disponibilidade...';
    }

    if (usernameStatus === 'available') {
      return 'Username disponível.';
    }

    if (usernameStatus === 'unavailable') {
      return 'Username já está em uso.';
    }

    if (usernameStatus === 'error') {
      return 'Verifique o username antes de continuar.';
    }

    return 'Verifique a disponibilidade para continuar.';
  }, [usernameNormalized, usernameStatus, usernameValid]);

  const renderStepIdentity = () => (
    <View style={styles.block}>
      <View style={styles.heroBlock}>
        <Text style={styles.stepTitle}>Crie seu perfil</Text>
        <Text style={styles.stepSubtitle}>
          Escolha uma foto, defina seu username e escreva uma bio curta.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.avatarArea}
        onPress={handleChangePhoto}
        disabled={isUploadingAvatar}
        activeOpacity={0.82}
      >
        <View style={[styles.avatar, Boolean(avatarUrl) && styles.avatarFilled]}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} resizeMode="cover" style={styles.avatarImage} />
          ) : isUploadingAvatar ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={styles.avatarIcon}>+</Text>
          )}
        </View>

        <Text style={styles.avatarHint}>
          {isUploadingAvatar ? 'Enviando foto...' : 'Adicionar foto'}
        </Text>
      </TouchableOpacity>

      <View style={styles.formCard}>
        <Text style={styles.inputLabel}>Username</Text>

        <View style={styles.usernameRow}>
          <TextInput
            value={username}
            onChangeText={handleUsernameChange}
            placeholder="@seunome"
            placeholderTextColor={colors.textTertiary}
            style={[styles.input, styles.usernameInput]}
            autoCapitalize="none"
            editable={!isSaving}
          />

          <TouchableOpacity
            style={[
              styles.checkUsernameButton,
              (!usernameValid || usernameStatus === 'checking') && styles.actionDisabled,
            ]}
            onPress={() => {
              void checkUsername();
            }}
            disabled={!usernameValid || usernameStatus === 'checking'}
            activeOpacity={0.78}
          >
            <Text style={styles.checkUsernameText}>
              {usernameStatus === 'checking' ? '...' : 'Verificar'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={[
            styles.validationText,
            usernameStatus === 'available' && styles.validationSuccess,
            (usernameStatus === 'unavailable' || usernameStatus === 'error') && styles.validationError,
          ]}
        >
          {usernameValidationText}
        </Text>

        <Text style={styles.inputLabel}>Bio</Text>

        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Conte algo sobre você..."
          placeholderTextColor={colors.textTertiary}
          style={[styles.input, styles.textarea]}
          multiline
          maxLength={150}
          editable={!isSaving}
        />

        <Text style={styles.counterText}>{bio.length}/150</Text>
      </View>
    </View>
  );

  const renderStepLocation = () => (
    <View style={styles.block}>
      <View style={styles.heroBlock}>
        <Text style={styles.stepTitle}>Sua cidade</Text>
        <Text style={styles.stepSubtitle}>
          Isso ajuda o app a mostrar lugares, eventos e conteúdos mais relevantes.
        </Text>
      </View>

      <View style={styles.formCard}>
        <TouchableOpacity
          style={[styles.locationButton, isResolvingLocation && styles.actionDisabled]}
          onPress={() => {
            void handleUseGps();
          }}
          disabled={isResolvingLocation}
          activeOpacity={0.78}
        >
          <Text style={styles.locationButtonText}>
            {isResolvingLocation ? 'Obtendo localização...' : 'Usar localização atual'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.inputLabel}>Cidade</Text>

        <TextInput
          value={city}
          onChangeText={setCity}
          placeholder="Digite o nome da cidade"
          placeholderTextColor={colors.textTertiary}
          style={styles.input}
          editable={!isSaving}
        />

        <View style={styles.infoRow}>
          <Text style={styles.infoText}>
            Sua localização só será usada com permissão do dispositivo.
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStepFinish = () => (
    <View style={styles.block}>
      <View style={styles.finishBadge}>
        <Text style={styles.finishIcon}>✓</Text>
      </View>

      <View style={styles.heroBlock}>
        <Text style={styles.stepTitle}>Tudo pronto</Text>
        <Text style={styles.stepSubtitle}>
          Confira seus dados antes de salvar seu perfil.
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumo do perfil</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Username</Text>
          <Text style={styles.summaryValue}>@{usernameNormalized}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Cidade</Text>
          <Text style={styles.summaryValue}>{city.trim()}</Text>
        </View>

        {bio.trim().length > 0 ? (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Bio</Text>
            <Text style={styles.summaryValue}>{bio.trim()}</Text>
          </View>
        ) : null}

        {avatarUrl ? (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Foto</Text>
            <Text style={styles.summaryValue}>Enviada</Text>
          </View>
        ) : null}
      </View>
    </View>
  );

  return (
    <AuthBackground>
      <View style={styles.container}>
        <ScreenHeader title="" onBack={handleBack} />

        <View style={styles.topArea}>
          <Text style={styles.progressText}>Passo {step} de 3</Text>

          <View style={styles.progressBar}>
            {([1, 2, 3] as const).map((value) => (
              <View
                key={value}
                style={[
                  styles.progressSegment,
                  value <= step ? styles.progressSegmentActive : undefined,
                ]}
              />
            ))}
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {step === 1 && renderStepIdentity()}
          {step === 2 && renderStepLocation()}
          {step === 3 && renderStepFinish()}
        </ScrollView>

        {requestError ? <Text style={styles.errorText}>{requestError}</Text> : null}

        <View style={styles.footer}>
          <Button
            label={isSaving ? 'Salvando...' : step === 3 ? 'Salvar e explorar' : 'Próximo'}
            onPress={() => {
              void handleNext();
            }}
            disabled={!canGoNext}
            loading={isSaving}
            fullWidth
            size="large"
            style={styles.footerButton}
          />
        </View>
      </View>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  topArea: {
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },

  progressText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },

  progressBar: {
    flexDirection: 'row',
    gap: spacing.xs,
  },

  progressSegment: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 999,
  },

  progressSegmentActive: {
    backgroundColor: colors.primary,
  },

  content: {
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  block: {
    marginTop: spacing.xl,
  },

  heroBlock: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  stepTitle: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.3,
  },

  stepSubtitle: {
    maxWidth: 330,
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  avatarArea: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  avatarFilled: {
    borderColor: colors.primary,
  },

  avatarImage: {
    width: '100%',
    height: '100%',
  },

  avatarIcon: {
    color: colors.primary,
    fontSize: 40,
    fontWeight: '300',
    marginTop: -4,
  },

  avatarHint: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginTop: spacing.sm,
  },

  formCard: {
    ...authPanelStyle,
    borderRadius: 26,
  },

  inputLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },

  usernameRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  usernameInput: {
    flex: 1,
  },

  checkUsernameButton: {
    minWidth: 96,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },

  checkUsernameText: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },

  input: {
    height: 48,
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
  },

  textarea: {
    minHeight: 96,
    height: 96,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },

  validationText: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    lineHeight: 17,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },

  validationSuccess: {
    color: '#27AE60',
  },

  validationError: {
    color: colors.error,
  },

  counterText: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    textAlign: 'right',
    marginTop: spacing.sm,
  },

  locationButton: {
    minHeight: 50,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: 'rgba(232, 100, 10, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },

  locationButtonText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },

  actionDisabled: {
    opacity: 0.55,
  },

  infoRow: {
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.lg,
  },

  infoText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 19,
    textAlign: 'center',
  },

  finishBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },

  finishIcon: {
    color: colors.text,
    fontSize: 38,
    fontWeight: '600',
    marginTop: -2,
  },

  summaryCard: {
    ...authPanelStyle,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 26,
    gap: spacing.md,
  },

  summaryTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },

  summaryRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },

  summaryLabel: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    marginBottom: 4,
  },

  summaryValue: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 19,
  },

  errorText: {
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    color: colors.error,
    fontSize: fontSize.sm,
    lineHeight: 18,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },

  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },

  footerButton: {
    maxWidth: 430,
    alignSelf: 'center',
    borderRadius: 999,
  },
});
