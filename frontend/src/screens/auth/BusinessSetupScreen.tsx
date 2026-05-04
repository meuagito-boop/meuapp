import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import * as ImagePicker from 'expo-image-picker';

import { Button, ScreenHeader } from '@components';
import { colors } from '@constants/colors';
import { fontSize, spacing } from '@constants/design';
import { authStore } from '@stores/authStore';
import { locationService } from '@services/api';
import { ApiRequestError } from '@services/api/ApiClient';
import GeolocationService from '@services/geolocation/GeolocationService';

type SetupStep = 1 | 2 | 3 | 4 | 5;
type EstablishmentCategory = {
  id: 'bar' | 'restaurant' | 'nightclub' | 'cafe' | 'lounge' | 'pub' | 'other';
  label: string;
  subcategories: string[];
};
type SelectedImage = {
  uri: string;
  fileName: string;
  mimeType: string;
};

const CATEGORIES: EstablishmentCategory[] = [
  { id: 'restaurant', label: 'Restaurante', subcategories: ['Pizzaria', 'Hamburgueria', 'Churrascaria', 'Buffet'] },
  { id: 'bar', label: 'Bar', subcategories: ['Bar de bairro', 'Bar tematico', 'Cervejaria', 'Boteco'] },
  { id: 'cafe', label: 'Cafe', subcategories: ['Coffee shop', 'Padaria cafe', 'Brunch', 'Doceria'] },
  { id: 'nightclub', label: 'Balada', subcategories: ['Casa de show', 'Balada eletronica', 'Sertanejo', 'Karaoke'] },
  { id: 'lounge', label: 'Lounge', subcategories: ['Lounge bar', 'Rooftop', 'Sunset', 'Wine bar'] },
  { id: 'pub', label: 'Pub', subcategories: ['Pub ingles', 'Pub com musica', 'Sports pub', 'Pub artesanal'] },
  { id: 'other', label: 'Outro', subcategories: ['Loja local', 'Servico local', 'Espaco cultural', 'Outro'] },
];

const isOwnedEstablishmentConflict = (error: unknown): error is ApiRequestError =>
  error instanceof ApiRequestError && error.statusCode === 409;

const isValidPhone = (value: string) => value.replace(/\D/g, '').length >= 10;

const ensureAbsoluteUrl = (value: string) => {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return new URL(normalized).toString();
};

const parseHoursWindow = (value: string) => {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed || trimmed === 'fechado') {
    return [];
  }

  if (trimmed === '24h') {
    return [{ opensAt: '00:00', closesAt: '23:59' }];
  }

  const match = trimmed.match(/^(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/);
  if (!match) {
    throw new Error('Use o formato 09:00-18:00, 24h ou deixe em branco para fechado.');
  }

  return [{ opensAt: match[1], closesAt: match[2] }];
};

const buildOpeningHours = (weekdays: string, saturday: string, sunday: string) => {
  const weekdaysWindow = parseHoursWindow(weekdays);
  const saturdayWindow = parseHoursWindow(saturday);
  const sundayWindow = parseHoursWindow(sunday);

  const payload: Record<string, unknown> = {};
  ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach((day) => {
    if (weekdaysWindow.length > 0) {
      payload[day] = weekdaysWindow;
    }
  });

  if (saturdayWindow.length > 0) {
    payload.saturday = saturdayWindow;
  }

  if (sundayWindow.length > 0) {
    payload.sunday = sundayWindow;
  }

  return Object.keys(payload).length > 0 ? payload : undefined;
};

const createUploadName = (prefix: string, asset: SelectedImage, fallbackIndex?: number) => {
  const extension = asset.fileName.split('.').pop() || 'jpg';
  const suffix = fallbackIndex != null ? `-${fallbackIndex}` : '';
  return `${prefix}${suffix}.${extension}`;
};

const formatCoordinates = (latitude: number, longitude: number) =>
  `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

async function pickSingleImage(label: string): Promise<SelectedImage | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Permissao da galeria negada.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.85,
  });

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    fileName: asset.fileName || `${label}-${Date.now()}.jpg`,
    mimeType: asset.mimeType || 'image/jpeg',
  };
}

export default function BusinessSetupScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const completeOnboarding = authStore((state) => state.completeOnboarding);

  const [step, setStep] = useState<SetupStep>(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');

  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [weekdaysHours, setWeekdaysHours] = useState('');
  const [saturdayHours, setSaturdayHours] = useState('');
  const [sundayHours, setSundayHours] = useState('');

  const [categoryId, setCategoryId] = useState<EstablishmentCategory['id'] | null>(null);
  const [subcategory, setSubcategory] = useState<string | null>(null);

  const [logoAsset, setLogoAsset] = useState<SelectedImage | null>(null);
  const [galleryAssets, setGalleryAssets] = useState<SelectedImage[]>([]);

  const [createdEstablishmentId, setCreatedEstablishmentId] = useState<string | null>(null);
  const [uploadedLogoUri, setUploadedLogoUri] = useState<string | null>(null);
  const [uploadedCoverUri, setUploadedCoverUri] = useState<string | null>(null);
  const [uploadedGalleryUris, setUploadedGalleryUris] = useState<string[]>([]);

  const selectedCategory = useMemo(
    () => CATEGORIES.find((category) => category.id === categoryId) ?? null,
    [categoryId]
  );

  const canContinue = useMemo(() => {
    if (step === 1) {
      return name.trim().length >= 3 && isValidPhone(phone) && description.trim().length >= 20;
    }

    if (step === 2) {
      return address.trim().length >= 6 && coordinates !== null;
    }

    if (step === 3) {
      return categoryId !== null && subcategory !== null;
    }

    return true;
  }, [address, categoryId, coordinates, description, name, phone, step, subcategory]);

  const handleBack = () => {
    if (isSubmitting) {
      return;
    }

    if (step === 1) {
      navigation.goBack();
      return;
    }

    setStep((previousStep) => (previousStep - 1) as SetupStep);
  };

  const handleNext = () => {
    if (isSubmitting || !canContinue) {
      return;
    }

    setSubmitError(null);
    if (step < 5) {
      setStep((previousStep) => (previousStep + 1) as SetupStep);
    }
  };

  const handleAddressChange = (value: string) => {
    setAddress(value);
    setCoordinates(null);
    setLocationStatus(null);
  };

  const confirmLocation = async () => {
    setIsGeocoding(true);
    setSubmitError(null);

    try {
      const results = await GeolocationService.geocodeAddress(address);
      const firstResult = results[0];

      if (!firstResult) {
        throw new Error('Nenhuma coordenada encontrada para este endereco.');
      }

      setCoordinates({
        latitude: firstResult.latitude,
        longitude: firstResult.longitude,
      });
      setLocationStatus(`Localizacao confirmada em ${formatCoordinates(firstResult.latitude, firstResult.longitude)}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao confirmar localizacao.';
      setCoordinates(null);
      setLocationStatus(null);
      setSubmitError(message);
    } finally {
      setIsGeocoding(false);
    }
  };

  const chooseLogo = async () => {
    try {
      const nextLogo = await pickSingleImage('logo');
      if (nextLogo) {
        setLogoAsset(nextLogo);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao selecionar a logo.';
      setSubmitError(message);
    }
  };

  const addGalleryImage = async () => {
    if (galleryAssets.length >= 10) {
      setSubmitError('A galeria permite no maximo 10 imagens.');
      return;
    }

    try {
      const nextAsset = await pickSingleImage(`gallery-${galleryAssets.length + 1}`);
      if (!nextAsset) {
        return;
      }

      setGalleryAssets((current) => [...current, nextAsset]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao selecionar imagem da galeria.';
      setSubmitError(message);
    }
  };

  const removeGalleryImage = (uri: string) => {
    setGalleryAssets((current) => current.filter((item) => item.uri !== uri));
  };

  const uploadPendingMedia = async (establishmentId: string) => {
    if (logoAsset && uploadedLogoUri !== logoAsset.uri) {
      await locationService.uploadEstablishmentMedia(
        establishmentId,
        logoAsset.uri,
        createUploadName('logo', logoAsset),
        logoAsset.mimeType,
        undefined,
        'logo'
      );
      setUploadedLogoUri(logoAsset.uri);
    }

    const [coverAsset, ...remainingGalleryAssets] = galleryAssets;

    if (coverAsset && uploadedCoverUri !== coverAsset.uri) {
      await locationService.uploadEstablishmentMedia(
        establishmentId,
        coverAsset.uri,
        createUploadName('cover', coverAsset),
        coverAsset.mimeType,
        undefined,
        'cover'
      );
      setUploadedCoverUri(coverAsset.uri);
    }

    for (let index = 0; index < remainingGalleryAssets.length; index += 1) {
      const asset = remainingGalleryAssets[index];
      if (uploadedGalleryUris.includes(asset.uri)) {
        continue;
      }

      await locationService.uploadEstablishmentMedia(
        establishmentId,
        asset.uri,
        createUploadName('gallery', asset, index + 1),
        asset.mimeType,
        undefined,
        'gallery'
      );
      setUploadedGalleryUris((current) => [...current, asset.uri]);
    }
  };

  const submitBusinessProfile = async () => {
    if (isSubmitting || !coordinates || !selectedCategory || !subcategory) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const normalizedWebsite = ensureAbsoluteUrl(website);
      const openingHours = buildOpeningHours(weekdaysHours, saturdayHours, sundayHours);
      const effectiveWhatsapp = whatsapp.trim().length > 0 ? whatsapp.trim() : phone.trim();

      let establishmentId = createdEstablishmentId;

      if (!establishmentId) {
        try {
          const createdEstablishment = await locationService.createEstablishment({
            name: name.trim(),
            description: description.trim(),
            category: selectedCategory.id,
            subcategory,
            address: address.trim(),
            phone: phone.trim(),
            whatsapp: effectiveWhatsapp,
            website: normalizedWebsite,
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            openingHours,
            isPublic: true,
          });

          establishmentId = createdEstablishment.id;
          setCreatedEstablishmentId(establishmentId);
        } catch (createError) {
          if (!isOwnedEstablishmentConflict(createError)) {
            throw createError;
          }

          try {
            const ownedEstablishment = await locationService.getOwnedEstablishment();
            establishmentId = ownedEstablishment.id;
            setCreatedEstablishmentId(establishmentId);
          } catch {
            throw createError;
          }
        }
      }

      await uploadPendingMedia(establishmentId);

      await completeOnboarding({
        tab: 'Profile',
        profileParams: {
          type: 'establishment',
          establishmentId,
          ownerView: true,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao publicar a vitrine.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepOne = () => (
    <View style={styles.block}>
      <Text style={styles.stepTitle}>Informacoes basicas</Text>
      <Text style={styles.stepSubtitle}>Defina os dados principais do seu estabelecimento.</Text>

      <Text style={styles.label}>Nome do negocio *</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Ex: Barbearia da Vila"
        placeholderTextColor={colors.textTertiary}
      />

      <Text style={styles.label}>Telefone principal *</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="(11) 99999-0000"
        keyboardType="phone-pad"
        placeholderTextColor={colors.textTertiary}
      />

      <Text style={styles.label}>WhatsApp</Text>
      <TextInput
        style={styles.input}
        value={whatsapp}
        onChangeText={setWhatsapp}
        placeholder="Se vazio, sera usado o telefone principal"
        keyboardType="phone-pad"
        placeholderTextColor={colors.textTertiary}
      />

      <Text style={styles.label}>Website</Text>
      <TextInput
        style={styles.input}
        value={website}
        onChangeText={setWebsite}
        placeholder="www.seunegocio.com.br"
        autoCapitalize="none"
        placeholderTextColor={colors.textTertiary}
      />

      <Text style={styles.label}>Descricao *</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Descreva seu negocio em ate 300 caracteres."
        placeholderTextColor={colors.textTertiary}
        multiline
        maxLength={300}
      />
      <Text style={styles.helper}>{description.length}/300 (minimo 20)</Text>
    </View>
  );

  const renderStepTwo = () => (
    <View style={styles.block}>
      <Text style={styles.stepTitle}>Endereco e horario</Text>
      <Text style={styles.stepSubtitle}>Confirme a localizacao e informe o horario publico.</Text>

      <Text style={styles.label}>Endereco *</Text>
      <TextInput
        style={[styles.input, styles.textareaSmall]}
        value={address}
        onChangeText={handleAddressChange}
        placeholder="Rua, numero, bairro e cidade"
        placeholderTextColor={colors.textTertiary}
        multiline
      />

      <TouchableOpacity
        style={styles.secondaryAction}
        onPress={() => void confirmLocation()}
        disabled={isGeocoding}
      >
        {isGeocoding ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Text style={styles.secondaryActionText}>Confirmar localizacao</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.helper}>
        {locationStatus || 'Use geocoding para validar as coordenadas antes de continuar.'}
      </Text>

      <Text style={styles.label}>Segunda a sexta</Text>
      <TextInput
        style={styles.input}
        value={weekdaysHours}
        onChangeText={setWeekdaysHours}
        placeholder="09:00-18:00 ou 24h"
        placeholderTextColor={colors.textTertiary}
      />

      <Text style={styles.label}>Sabado</Text>
      <TextInput
        style={styles.input}
        value={saturdayHours}
        onChangeText={setSaturdayHours}
        placeholder="10:00-14:00 ou fechado"
        placeholderTextColor={colors.textTertiary}
      />

      <Text style={styles.label}>Domingo</Text>
      <TextInput
        style={styles.input}
        value={sundayHours}
        onChangeText={setSundayHours}
        placeholder="Fechado ou 24h"
        placeholderTextColor={colors.textTertiary}
      />
    </View>
  );

  const renderStepThree = () => (
    <View style={styles.block}>
      <Text style={styles.stepTitle}>Categoria publica</Text>
      <Text style={styles.stepSubtitle}>Essa classificacao define como a vitrine aparece na busca.</Text>

      <Text style={styles.label}>Categoria *</Text>
      <View style={styles.chipsRow}>
        {CATEGORIES.map((category) => {
          const active = category.id === categoryId;
          return (
            <TouchableOpacity
              key={category.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => {
                setCategoryId(category.id);
                setSubcategory(null);
              }}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{category.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.label}>Subcategoria *</Text>
      <View style={styles.chipsRow}>
        {(selectedCategory?.subcategories ?? []).map((item) => {
          const active = item === subcategory;
          return (
            <TouchableOpacity
              key={item}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setSubcategory(item)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderImagePreview = (asset: SelectedImage, label: string, onRemove?: () => void) => (
    <View style={styles.previewCard}>
      <Image source={{ uri: asset.uri }} style={styles.previewImage} resizeMode="cover" />
      <View style={styles.previewInfo}>
        <Text style={styles.previewTitle}>{label}</Text>
        <Text style={styles.previewSubtitle} numberOfLines={1}>
          {asset.fileName}
        </Text>
      </View>
      {onRemove ? (
        <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
          <Text style={styles.removeButtonText}>X</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  const renderStepFour = () => (
    <View style={styles.block}>
      <Text style={styles.stepTitle}>Midia da vitrine</Text>
      <Text style={styles.stepSubtitle}>Logo e fotos sao opcionais, mas entram no perfil publico se voce enviar.</Text>

      <TouchableOpacity style={styles.mediaAction} onPress={() => void chooseLogo()}>
        <Text style={styles.mediaActionTitle}>{logoAsset ? 'Trocar logo' : 'Adicionar logo'}</Text>
        <Text style={styles.mediaActionText}>A logo vira o avatar quadrado do perfil.</Text>
      </TouchableOpacity>

      {logoAsset ? renderImagePreview(logoAsset, 'Logo selecionada') : null}

      <TouchableOpacity style={styles.mediaAction} onPress={() => void addGalleryImage()}>
        <Text style={styles.mediaActionTitle}>Adicionar foto da galeria</Text>
        <Text style={styles.mediaActionText}>
          Ate 10 imagens. A primeira foto publicada vira a capa da vitrine.
        </Text>
      </TouchableOpacity>

      {galleryAssets.length > 0 ? (
        <View style={styles.galleryList}>
          {galleryAssets.map((asset, index) =>
            renderImagePreview(asset, index === 0 ? 'Capa da vitrine' : `Galeria ${index + 1}`, () =>
              removeGalleryImage(asset.uri)
            )
          )}
        </View>
      ) : (
        <Text style={styles.helper}>Nenhuma foto selecionada ainda.</Text>
      )}
    </View>
  );

  const renderStepFive = () => (
    <View style={styles.block}>
      <Text style={styles.stepTitle}>Revisao final</Text>
      <Text style={styles.stepSubtitle}>Confira os dados que serao publicados na sua pagina.</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>{name || 'Seu estabelecimento'}</Text>
        <Text style={styles.summaryItem}>{address || 'Endereco pendente'}</Text>
        <Text style={styles.summaryItem}>
          {selectedCategory?.label ?? 'Categoria pendente'}
          {subcategory ? ` · ${subcategory}` : ''}
        </Text>
        <Text style={styles.summaryItem}>{phone || 'Telefone pendente'}</Text>
        <Text style={styles.summaryItem}>{coordinates ? formatCoordinates(coordinates.latitude, coordinates.longitude) : 'Coordenadas pendentes'}</Text>
        <Text style={styles.summaryItem}>
          {logoAsset ? 'Logo pronta para upload' : 'Sem logo'}
          {` · ${galleryAssets.length} foto(s) selecionada(s)`}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Cadastro empresarial" onBack={handleBack} />
      <View style={styles.progressHeader}>
        <Text style={styles.progressText}>Passo {step} de 5</Text>
      </View>

      <View style={styles.progressBar}>
        {[1, 2, 3, 4, 5].map((value) => (
          <View
            key={value}
            style={[styles.progressSegment, value <= step && styles.progressSegmentActive]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {submitError ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Ajuste necessario</Text>
            <Text style={styles.errorText}>{submitError}</Text>
          </View>
        ) : null}

        {step === 1 && renderStepOne()}
        {step === 2 && renderStepTwo()}
        {step === 3 && renderStepThree()}
        {step === 4 && renderStepFour()}
        {step === 5 && renderStepFive()}
      </ScrollView>

      <View style={styles.footer}>
        {step < 5 ? (
          <Button
            label="Continuar"
            onPress={handleNext}
            disabled={!canContinue}
            fullWidth
            size="large"
          />
        ) : (
          <Button
            label="Publicar e ver meu perfil"
            onPress={() => void submitBusinessProfile()}
            disabled={isSubmitting}
            loading={isSubmitting}
            fullWidth
            size="large"
          />
        )}
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
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  progressSegmentActive: {
    backgroundColor: colors.primary,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  errorCard: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: '#1A0F05',
    gap: spacing.xs,
  },
  errorTitle: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 18,
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
  label: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  input: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  textareaSmall: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
  helper: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
  secondaryAction: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  secondaryActionText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: '#1A0F05',
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.primary,
  },
  mediaAction: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.xs,
  },
  mediaActionTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  mediaActionText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  galleryList: {
    gap: spacing.sm,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: colors.background,
  },
  previewInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  previewTitle: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  previewSubtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  removeButtonText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  summaryTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  summaryItem: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
});
