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

type SetupStep = 1 | 2 | 3;

type UsernameStatus = 'idle' | 'checking' | 'available' | 'unavailable' | 'error';

const USERNAME_PATTERN = /^[a-zA-Z0-9._]{3,30}$/;

const normalizeUsername = (value: string) => value.trim().replace(/^@/, '').toLowerCase();

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const formatCityFromAddress = (address: Awaited<ReturnType<typeof GeolocationService.reverseGeocodeCoordinates>>[number]) => {
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
      setRequestError('Use entre 3 e 30 caracteres: letras, numeros, ponto ou underscore.');
      return;
    }

    setUsernameStatus('checking');
    setRequestError(null);

    try {
      const result = await userService.checkUsernameAvailability(usernameNormalized);
      setUsernameStatus(result.available ? 'available' : 'unavailable');

      if (!result.available) {
        setRequestError('Este username ja esta em uso.');
      }
    } catch (error) {
      setUsernameStatus('error');
      setRequestError(getErrorMessage(error, 'Nao foi possivel verificar o username.'));
    }
  };

  const handleChangePhoto = async () => {
    setRequestError(null);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permissao negada', 'Autorize o acesso a galeria para enviar sua foto.');
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
      const message = getErrorMessage(error, 'Nao foi possivel enviar sua foto.');
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
        throw new Error('Nao foi possivel identificar a cidade pela localizacao.');
      }

      setCity(resolvedCity);
    } catch (error) {
      const message = getErrorMessage(error, 'Nao foi possivel usar sua localizacao.');
      setRequestError(message);
      Alert.alert('Localizacao indisponivel', message);
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
      const message = getErrorMessage(error, 'Nao foi possivel finalizar seu perfil.');
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
      return 'Use apenas letras, numeros, ponto e underscore.';
    }

    if (usernameStatus === 'checking') {
      return 'Verificando no backend...';
    }

    if (usernameStatus === 'available') {
      return 'Username disponivel.';
    }

    if (usernameStatus === 'unavailable') {
      return 'Username ja esta em uso.';
    }

    if (usernameStatus === 'error') {
      return 'Verifique o username antes de continuar.';
    }

    return 'Verifique a disponibilidade para continuar.';
  }, [usernameNormalized, usernameStatus, usernameValid]);

  const renderStepIdentity = () => (
    <View style={styles.block}>
      <Text style={styles.stepTitle}>Como voce quer aparecer?</Text>
      <Text style={styles.stepSubtitle}>Defina seu username e uma bio opcional.</Text>

      <TouchableOpacity
        style={styles.avatarArea}
        onPress={handleChangePhoto}
        disabled={isUploadingAvatar}
      >
        <View style={[styles.avatar, Boolean(avatarUrl) && styles.avatarFilled]}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} resizeMode="cover" style={styles.avatarImage} />
          ) : isUploadingAvatar ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={styles.avatarIcon}>IMG</Text>
          )}
        </View>
        <Text style={styles.avatarHint}>
          {isUploadingAvatar ? 'Enviando foto...' : 'Adicionar foto real'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.inputLabel}>@username</Text>
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
        >
          <Text style={styles.checkUsernameText}>
            {usernameStatus === 'checking' ? '...' : 'Verificar'}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.validationText}>{usernameValidationText}</Text>

      <Text style={styles.inputLabel}>Bio (opcional)</Text>
      <TextInput
        value={bio}
        onChangeText={setBio}
        placeholder="Conte algo sobre voce..."
        placeholderTextColor={colors.textTertiary}
        style={[styles.input, styles.textarea]}
        multiline
        maxLength={150}
        editable={!isSaving}
      />
      <Text style={styles.validationText}>{bio.length}/150</Text>
    </View>
  );

  const renderStepLocation = () => (
    <View style={styles.block}>
      <Text style={styles.stepTitle}>Onde voce esta?</Text>
      <Text style={styles.stepSubtitle}>Sua cidade ajuda o app a priorizar descoberta local.</Text>

      <TouchableOpacity
        style={[styles.secondaryAction, isResolvingLocation && styles.actionDisabled]}
        onPress={() => {
          void handleUseGps();
        }}
        disabled={isResolvingLocation}
      >
        <Text style={styles.secondaryActionText}>
          {isResolvingLocation ? 'Obtendo localizacao...' : 'Usar minha localizacao atual'}
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
          A localizacao so sera usada com permissao do dispositivo.
        </Text>
      </View>
    </View>
  );

  const renderStepFinish = () => (
    <View style={styles.block}>
      <Text style={styles.finishIcon}>OK</Text>
      <Text style={styles.stepTitle}>Revise seu perfil</Text>
      <Text style={styles.stepSubtitle}>Ao finalizar, estes dados serao salvos no backend.</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumo</Text>
        <Text style={styles.summaryItem}>@{usernameNormalized}</Text>
        <Text style={styles.summaryItem}>{city.trim()}</Text>
        {bio.trim().length > 0 && <Text style={styles.summaryItem}>{bio.trim()}</Text>}
        {avatarUrl && <Text style={styles.summaryItem}>Foto enviada</Text>}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Configurar perfil" onBack={handleBack} />
      <View style={styles.progressHeader}>
        <Text style={styles.progressText}>Passo {step} de 3</Text>
      </View>

      <View style={styles.progressBar}>
        {([1, 2, 3] as const).map((value) => (
          <View
            key={value}
            style={[styles.progressSegment, value <= step ? styles.progressSegmentActive : undefined]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && renderStepIdentity()}
        {step === 2 && renderStepLocation()}
        {step === 3 && renderStepFinish()}
      </ScrollView>

      {requestError ? <Text style={styles.errorText}>{requestError}</Text> : null}

      <View style={styles.footer}>
        <Button
          label={isSaving ? 'Salvando...' : step === 3 ? 'Salvar e explorar' : 'Proximo'}
          onPress={() => {
            void handleNext();
          }}
          disabled={!canGoNext}
          loading={isSaving}
          fullWidth
          size="large"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  progressText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  progressBar: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 3,
  },
  progressSegmentActive: {
    backgroundColor: colors.primary,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  block: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  stepTitle: {
    color: colors.text,
    fontSize: fontSize.xxxl,
    fontWeight: '800',
  },
  stepSubtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 19,
  },
  avatarArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
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
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  avatarHint: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    flex: 1,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: '700',
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
    minWidth: 92,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  checkUsernameText: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  input: {
    height: 42,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
  },
  textarea: {
    minHeight: 90,
    height: 90,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  validationText: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
  },
  secondaryAction: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondaryActionText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  actionDisabled: {
    opacity: 0.55,
  },
  infoRow: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 19,
  },
  finishIcon: {
    color: colors.primary,
    fontSize: fontSize.xxxl,
    fontWeight: '900',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
  },
  summaryTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  summaryItem: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  errorText: {
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
    gap: spacing.md,
  },
});
