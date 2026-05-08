import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { HeaderBackButton } from '@components';
import { colors } from '@constants/colors';
import { fontSize, spacing } from '@constants/design';
import GeolocationService from '@services/geolocation/GeolocationService';
import { userStore } from '@stores/userStore';

type CityMode = 'edit' | 'confirm';

type GeocodedAddress = Awaited<
  ReturnType<typeof GeolocationService.reverseGeocodeCoordinates>
>[number];

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const formatCityFromAddress = (address: GeocodedAddress) => {
  const city = address.city || address.subregion || address.district || address.name;
  const region = address.region;

  if (city && region) {
    return `${city}, ${region}`;
  }

  return city || region || '';
};

export default function SettingsCityScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const profile = userStore((state) => state.profile);
  const getProfile = userStore((state) => state.getProfile);
  const updateProfile = userStore((state) => state.updateProfile);

  const [mode, setMode] = useState<CityMode>('edit');
  const [city, setCity] = useState(profile?.location || '');
  const [selectedCity, setSelectedCity] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(!profile);
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      if (profile) {
        return;
      }

      setIsLoadingProfile(true);

      try {
        const loadedProfile = await getProfile();
        if (active) {
          setCity(loadedProfile.location || '');
        }
      } catch (error) {
        if (active) {
          setErrorMessage(getErrorMessage(error, 'Nao foi possivel carregar sua cidade atual.'));
        }
      } finally {
        if (active) {
          setIsLoadingProfile(false);
        }
      }
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, [getProfile, profile]);

  const currentCity = profile?.location?.trim();
  const canReview = city.trim().length > 1 && !isLoadingProfile && !isSaving;

  const handleReviewCity = () => {
    const nextCity = city.trim();

    if (nextCity.length < 2) {
      setErrorMessage('Informe uma cidade valida antes de continuar.');
      return;
    }

    setSelectedCity(nextCity);
    setErrorMessage(null);
    setMode('confirm');
  };

  const handleUseGps = async () => {
    setIsResolvingLocation(true);
    setErrorMessage(null);

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
      setSelectedCity(resolvedCity);
      setMode('confirm');
    } catch (error) {
      const message = getErrorMessage(error, 'Nao foi possivel usar sua localizacao.');
      setErrorMessage(message);
      Alert.alert('Localizacao indisponivel', message);
    } finally {
      setIsResolvingLocation(false);
    }
  };

  const handleConfirmCity = async () => {
    if (!selectedCity) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await updateProfile({ location: selectedCity });
      navigation.goBack();
    } catch (error) {
      const message = getErrorMessage(error, 'Nao foi possivel atualizar sua cidade.');
      setErrorMessage(message);
      Alert.alert('Erro ao atualizar cidade', message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChooseOther = () => {
    setMode('edit');
    setSelectedCity('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <HeaderBackButton onPress={() => navigation.goBack()} disabled={isSaving} />
        <Text style={styles.headerTitle}>Trocar cidade</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={isSaving}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      {mode === 'edit' ? (
        <View style={styles.content}>
          <View style={styles.currentCard}>
            <Text style={styles.currentLabel}>Cidade atual</Text>
            <Text style={styles.currentValue}>{currentCity || 'Nenhuma cidade salva'}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.gpsCard,
              (isResolvingLocation || isLoadingProfile || isSaving) && styles.disabled,
            ]}
            onPress={() => {
              void handleUseGps();
            }}
            disabled={isResolvingLocation || isLoadingProfile || isSaving}
          >
            <View>
              <Text style={styles.gpsTitle}>Usar minha localizacao</Text>
              <Text style={styles.gpsSubtitle}>
                {isResolvingLocation
                  ? 'Detectando cidade...'
                  : 'Detectar cidade com permissao do dispositivo'}
              </Text>
            </View>
            {isResolvingLocation ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.chevron}>{'>'}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.formBlock}>
            <Text style={styles.inputLabel}>Cidade</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Digite sua cidade"
              placeholderTextColor={colors.textTertiary}
              value={city}
              onChangeText={(value) => {
                setCity(value);
                setErrorMessage(null);
              }}
              editable={!isLoadingProfile && !isSaving}
            />
            <Text style={styles.helperText}>
              Esta cidade sera salva no seu perfil e usada como preferencia de descoberta local.
            </Text>
          </View>

          {isLoadingProfile ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>Carregando perfil...</Text>
            </View>
          ) : null}

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <TouchableOpacity
            style={[styles.primaryButton, !canReview && styles.disabled]}
            onPress={handleReviewCity}
            disabled={!canReview}
          >
            <Text style={styles.primaryButtonText}>Revisar cidade</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.confirmContainer}>
          <Text style={styles.confirmTitle}>Confirmar cidade</Text>
          <Text style={styles.confirmCity}>{selectedCity}</Text>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <TouchableOpacity
            style={[styles.confirmButton, isSaving && styles.disabled]}
            onPress={() => {
              void handleConfirmCity();
            }}
            disabled={isSaving}
          >
            <Text style={styles.confirmButtonText}>
              {isSaving ? 'Atualizando...' : 'Confirmar e atualizar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleChooseOther} style={styles.chooseOther} disabled={isSaving}>
            <Text style={styles.chooseOtherText}>Escolher outra cidade</Text>
          </TouchableOpacity>
        </View>
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  currentCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  currentLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  currentValue: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  gpsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  gpsTitle: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  gpsSubtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  chevron: {
    color: colors.textTertiary,
    fontSize: fontSize.xxl,
  },
  formBlock: {
    gap: spacing.sm,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  searchInput: {
    color: colors.text,
    fontSize: fontSize.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  disabled: {
    opacity: 0.55,
  },
  primaryButton: {
    borderRadius: 12,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: 'auto',
  },
  primaryButtonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  confirmContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  confirmTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  confirmCity: {
    color: colors.primary,
    fontSize: fontSize.xxl,
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmButton: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  confirmButtonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  chooseOther: {
    paddingVertical: spacing.sm,
  },
  chooseOtherText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
