import React, { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
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
import {
  ParamListBase,
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { HeaderBackButton } from '@components';
import { colors } from '@constants/colors';
import { fontSize, spacing } from '@constants/design';
import { catalogService } from '@services/api';
import type { CatalogProduct, SaveProductPayload } from '@services/api/CatalogService';

type ProductManagementRouteParams = {
  establishmentId?: string;
  establishmentName?: string;
};

type ProductForm = {
  name: string;
  description: string;
  category: string;
  price: string;
};

const EMPTY_FORM: ProductForm = {
  name: '',
  description: '',
  category: '',
  price: '',
};

const formatPrice = (value?: number | null) => {
  if (value == null) {
    return 'Consulte';
  }

  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

const formatPriceInput = (value?: number | null) => {
  if (value == null) {
    return '';
  }

  return value.toFixed(2).replace('.', ',');
};

const parsePriceInput = (value: string): number | undefined => {
  const normalized = value.trim().replace(/\./g, '').replace(',', '.');
  if (normalized.length === 0) {
    return undefined;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error('Informe um preco valido.');
  }

  return parsed;
};

const getUploadName = (asset: ImagePicker.ImagePickerAsset) =>
  asset.fileName || `produto-${Date.now()}.jpg`;

const getUploadMimeType = (asset: ImagePicker.ImagePickerAsset) =>
  asset.mimeType || 'image/jpeg';

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export default function ProductManagementScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<ParamListBase, string>>();
  const routeParams = route.params as ProductManagementRouteParams | undefined;
  const establishmentId = routeParams?.establishmentId;
  const establishmentName = routeParams?.establishmentName || 'Seu estabelecimento';

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [uploadingProductId, setUploadingProductId] = useState<string | null>(null);
  const [archivingProductId, setArchivingProductId] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    if (!establishmentId) {
      setProducts([]);
      setLoadingError('Estabelecimento nao informado.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadingError(null);

    try {
      const response = await catalogService.getEstablishmentProducts(establishmentId);
      setProducts(response);
    } catch (error) {
      setProducts([]);
      setLoadingError(getErrorMessage(error, 'Nao foi possivel carregar a vitrine.'));
    } finally {
      setIsLoading(false);
    }
  }, [establishmentId]);

  useFocusEffect(
    useCallback(() => {
      void loadProducts();
    }, [loadProducts])
  );

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingProductId(null);
  };

  const startEditing = (product: CatalogProduct) => {
    setEditingProductId(product.id);
    setForm({
      name: product.name,
      description: product.description || '',
      category: product.category || '',
      price: formatPriceInput(product.price),
    });
  };

  const buildPayload = (): SaveProductPayload | null => {
    const name = form.name.trim();
    if (name.length < 2) {
      Alert.alert('Nome invalido', 'Informe um nome com pelo menos 2 caracteres.');
      return null;
    }

    try {
      return {
        name,
        description: form.description.trim() || undefined,
        category: form.category.trim() || undefined,
        price: parsePriceInput(form.price),
      };
    } catch (error) {
      Alert.alert('Preco invalido', getErrorMessage(error, 'Informe um preco valido.'));
      return null;
    }
  };

  const handleSave = async () => {
    if (!establishmentId || isSaving) {
      return;
    }

    const payload = buildPayload();
    if (!payload) {
      return;
    }

    setIsSaving(true);
    setLoadingError(null);

    try {
      if (editingProductId) {
        await catalogService.updateProduct(establishmentId, editingProductId, payload);
        Alert.alert('Item atualizado', 'As informacoes da vitrine foram salvas.');
      } else {
        await catalogService.createProduct(establishmentId, payload);
        Alert.alert('Item criado', 'O item foi publicado na vitrine.');
      }

      resetForm();
      await loadProducts();
    } catch (error) {
      Alert.alert('Falha ao salvar', getErrorMessage(error, 'Nao foi possivel salvar o item.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = (product: CatalogProduct) => {
    if (!establishmentId || archivingProductId) {
      return;
    }

    Alert.alert('Arquivar item', `Remover "${product.name}" da vitrine publica?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Arquivar',
        style: 'destructive',
        onPress: () => {
          void archiveProduct(product);
        },
      },
    ]);
  };

  const archiveProduct = async (product: CatalogProduct) => {
    if (!establishmentId) {
      return;
    }

    setArchivingProductId(product.id);

    try {
      await catalogService.archiveProduct(establishmentId, product.id);
      if (editingProductId === product.id) {
        resetForm();
      }
      await loadProducts();
    } catch (error) {
      Alert.alert('Falha ao arquivar', getErrorMessage(error, 'Nao foi possivel arquivar o item.'));
    } finally {
      setArchivingProductId(null);
    }
  };

  const handleUploadImage = async (product: CatalogProduct) => {
    if (!establishmentId || uploadingProductId) {
      return;
    }

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permissao negada', 'Autorize o acesso a galeria para enviar a imagem.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
      });

      if (result.canceled || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      setUploadingProductId(product.id);

      await catalogService.uploadProductMedia(
        establishmentId,
        product.id,
        asset.uri,
        getUploadName(asset),
        getUploadMimeType(asset)
      );

      await loadProducts();
      Alert.alert('Imagem enviada', 'A imagem principal do item foi atualizada.');
    } catch (error) {
      Alert.alert('Falha no upload', getErrorMessage(error, 'Nao foi possivel enviar a imagem.'));
    } finally {
      setUploadingProductId(null);
    }
  };

  const renderProduct = (product: CatalogProduct) => {
    const isEditing = editingProductId === product.id;
    const isUploading = uploadingProductId === product.id;
    const isArchiving = archivingProductId === product.id;
    const imageUrl = product.imageUrl || product.mainImageUrl || null;

    return (
      <View key={product.id} style={[styles.productCard, isEditing && styles.productCardActive]}>
        <View style={styles.productHeader}>
          <View style={styles.productMedia}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} resizeMode="cover" style={styles.productImage} />
            ) : (
              <Text style={styles.productFallback}>PRD</Text>
            )}
          </View>

          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productMeta}>{product.category || 'Sem categoria'}</Text>
            <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
          </View>
        </View>

        {product.description ? (
          <Text style={styles.productDescription} numberOfLines={3}>
            {product.description}
          </Text>
        ) : null}

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            disabled={isSaving || isArchiving}
            onPress={() => startEditing(product)}
          >
            <Text style={styles.secondaryButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            disabled={isUploading || isArchiving}
            onPress={() => void handleUploadImage(product)}
          >
            <Text style={styles.secondaryButtonText}>{isUploading ? 'Enviando...' : 'Imagem'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryButton, styles.dangerButton]}
            disabled={isArchiving || isUploading}
            onPress={() => handleArchive(product)}
          >
            <Text style={styles.dangerButtonText}>{isArchiving ? 'Arquivando...' : 'Arquivar'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <HeaderBackButton onPress={() => navigation.goBack()} />
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Gerenciar vitrine</Text>
          <Text style={styles.subtitle}>{establishmentName}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>
            {editingProductId ? 'Editar item' : 'Novo item'}
          </Text>

          <Text style={styles.label}>Nome *</Text>
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={(value) => setForm((current) => ({ ...current, name: value }))}
            placeholder="Ex: Combo burger artesanal"
            placeholderTextColor={colors.textTertiary}
            editable={!isSaving}
          />

          <Text style={styles.label}>Categoria</Text>
          <TextInput
            style={styles.input}
            value={form.category}
            onChangeText={(value) => setForm((current) => ({ ...current, category: value }))}
            placeholder="Ex: Lanches"
            placeholderTextColor={colors.textTertiary}
            editable={!isSaving}
          />

          <Text style={styles.label}>Preco</Text>
          <TextInput
            style={styles.input}
            value={form.price}
            onChangeText={(value) =>
              setForm((current) => ({ ...current, price: value.replace(/[^\d,.]/g, '') }))
            }
            placeholder="39,90"
            placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
            editable={!isSaving}
          />

          <Text style={styles.label}>Descricao</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.description}
            onChangeText={(value) => setForm((current) => ({ ...current, description: value }))}
            placeholder="Descreva o item publicado na vitrine"
            placeholderTextColor={colors.textTertiary}
            editable={!isSaving}
            multiline
            textAlignVertical="top"
          />

          <View style={styles.formActions}>
            <TouchableOpacity
              style={[styles.primaryButton, isSaving && styles.disabledButton]}
              disabled={isSaving}
              onPress={() => void handleSave()}
            >
              <Text style={styles.primaryButtonText}>
                {isSaving ? 'Salvando...' : editingProductId ? 'Salvar alteracoes' : 'Publicar item'}
              </Text>
            </TouchableOpacity>
            {editingProductId ? (
              <TouchableOpacity style={styles.cancelButton} disabled={isSaving} onPress={resetForm}>
                <Text style={styles.cancelButtonText}>Cancelar edicao</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Itens publicados</Text>
          <TouchableOpacity onPress={() => void loadProducts()}>
            <Text style={styles.refreshText}>Atualizar</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.stateText}>Carregando vitrine...</Text>
          </View>
        ) : loadingError ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>Falha ao carregar</Text>
            <Text style={styles.stateText}>{loadingError}</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>Nenhum item publicado</Text>
            <Text style={styles.stateText}>
              Crie o primeiro item para que ele apareca na vitrine publica.
            </Text>
          </View>
        ) : (
          <View style={styles.productsList}>{products.map(renderProduct)}</View>
        )}
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
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  formCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  label: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.background,
    color: colors.text,
    fontSize: fontSize.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  textArea: {
    minHeight: 96,
  },
  formActions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  primaryButton: {
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  cancelButton: {
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  refreshText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  stateCard: {
    minHeight: 150,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  stateTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  stateText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 19,
  },
  productsList: {
    gap: spacing.md,
  },
  productCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  productCardActive: {
    borderColor: colors.primary,
  },
  productHeader: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  productMedia: {
    width: 78,
    height: 78,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productFallback: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
  },
  productName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  productMeta: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
  productPrice: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  productDescription: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 19,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  secondaryButton: {
    minHeight: 38,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  dangerButton: {
    borderColor: colors.error,
  },
  dangerButtonText: {
    color: colors.error,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
