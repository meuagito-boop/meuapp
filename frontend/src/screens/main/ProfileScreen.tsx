import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ParamListBase, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors } from '@constants/colors';
import { componentSizes, fontSize, spacing } from '@constants/design';
import { authStore } from '@stores/authStore';
import { catalogService, locationService, userService } from '@services/api';
import { activityHistoryService } from '@services/activity/ActivityHistoryService';
import type { CatalogProduct } from '@services/api/CatalogService';
import type { Establishment, Review } from '@services/api/LocationService';
import type { PublicUserProfile } from '@services/api/UserService';

type ProfileType = 'user' | 'establishment';
type EstablishmentTab = 'Tudo' | 'Midia' | 'Avaliacoes' | 'Servicos';
type ProfileRouteParams = {
  type?: ProfileType;
  userId?: string;
  establishmentId?: string;
  ownerView?: boolean;
};

const ESTABLISHMENT_TABS: EstablishmentTab[] = ['Tudo', 'Midia', 'Avaliacoes', 'Servicos'];

const DAY_LABELS: Record<string, string> = {
  monday: 'Segunda',
  tuesday: 'Terca',
  wednesday: 'Quarta',
  thursday: 'Quinta',
  friday: 'Sexta',
  saturday: 'Sabado',
  sunday: 'Domingo',
};

const formatPrice = (value?: number | null) => {
  if (value == null) {
    return 'Consulte';
  }

  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

const formatDistance = (distanceKm?: number | null) => {
  if (distanceKm == null) {
    return 'Sem distancia';
  }

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }

  return `${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)}km`;
};

const getInitials = (value: string) =>
  value
    .split(' ')
    .map((chunk) => chunk.trim().charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

const getMediaUrls = (establishment: Establishment | null) => {
  if (!establishment) {
    return [];
  }

  return Array.from(
    new Set(
      [
        establishment.coverImageUrl ?? null,
        establishment.logoUrl ?? null,
        establishment.image ?? null,
        ...establishment.galleryUrls,
      ].filter((item): item is string => typeof item === 'string' && item.length > 0)
    )
  );
};

const getOpeningHoursRows = (openingHours: Establishment['openingHours']) => {
  if (!openingHours) {
    return [];
  }

  return Object.entries(openingHours)
    .map(([day, value]) => {
      if (!Array.isArray(value) || value.length === 0) {
        return null;
      }

      const windows = value
        .map((item) => {
          if (!item || typeof item !== 'object') {
            return null;
          }

          const opensAt = typeof (item as { opensAt?: unknown }).opensAt === 'string'
            ? (item as { opensAt: string }).opensAt
            : null;
          const closesAt = typeof (item as { closesAt?: unknown }).closesAt === 'string'
            ? (item as { closesAt: string }).closesAt
            : null;

          if (!opensAt || !closesAt) {
            return null;
          }

          return `${opensAt} - ${closesAt}`;
        })
        .filter((item): item is string => typeof item === 'string');

      if (windows.length === 0) {
        return null;
      }

      return {
        label: DAY_LABELS[day] ?? day,
        value: windows.join(', '),
      };
    })
    .filter(
      (item): item is { label: string; value: string } =>
        Boolean(item) && typeof item === 'object'
    );
};

async function openExternalUrl(url: string) {
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  }
}

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<ParamListBase, string>>();
  const routeParams = route.params as ProfileRouteParams | undefined;
  const user = authStore((state) => state.user);

  const requestedType: ProfileType =
    routeParams?.type ?? (user?.profileType === 'ESTABLISHMENT' ? 'establishment' : 'user');
  const requestedUserId = routeParams?.userId;
  const requestedEstablishmentId = routeParams?.establishmentId;
  const isOwnUserProfile =
    requestedType === 'user' && (!requestedUserId || requestedUserId === user?.id);
  const isOwnerEstablishmentView =
    requestedType === 'establishment' &&
    user?.profileType === 'ESTABLISHMENT' &&
    (!requestedEstablishmentId || routeParams?.ownerView === true);

  const [activeTab, setActiveTab] = useState<EstablishmentTab>('Tudo');
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [publicUser, setPublicUser] = useState<PublicUserProfile | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);

  useEffect(() => {
    setActiveTab('Tudo');
  }, [requestedEstablishmentId, requestedType, requestedUserId]);

  useEffect(() => {
    let isMounted = true;

    const loadEstablishmentProfile = async () => {
      if (requestedType !== 'establishment') {
        setEstablishment(null);
        setProducts([]);
        setLoadError(null);
        setIsLoading(false);
        return;
      }

      if (!isOwnerEstablishmentView && !requestedEstablishmentId) {
        setLoadError('Perfil de estabelecimento sem identificador.');
        setEstablishment(null);
        setProducts([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        const nextEstablishment = isOwnerEstablishmentView
          ? await locationService.getOwnedEstablishment()
          : await locationService.getEstablishment(requestedEstablishmentId as string);
        const nextProducts = await catalogService.getEstablishmentProducts(nextEstablishment.id);

        if (!isMounted) {
          return;
        }

        setEstablishment(nextEstablishment);
        setProducts(nextProducts);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : 'Falha ao carregar o perfil do estabelecimento.';
        setLoadError(message);
        setEstablishment(null);
        setProducts([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadEstablishmentProfile();

    return () => {
      isMounted = false;
    };
  }, [isOwnerEstablishmentView, requestedEstablishmentId, requestedType]);

  useEffect(() => {
    if (requestedType !== 'establishment' || !establishment) {
      setIsFavorite(false);
      return;
    }

    void activityHistoryService.recordViewed({
      targetType: 'establishment',
      targetId: establishment.id,
      title: establishment.name,
      meta: establishment.subcategory || establishment.category,
    });

    if (isOwnerEstablishmentView) {
      setIsFavorite(false);
      return;
    }

    let isMounted = true;

    locationService
      .listFavoriteEstablishments(1, 100)
      .then((response) => {
        if (isMounted) {
          setIsFavorite(response.data.some((item) => item.id === establishment.id));
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsFavorite(establishment.isFavorited === true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [establishment, isOwnerEstablishmentView, requestedType]);

  useEffect(() => {
    let isMounted = true;

    const loadPublicUserProfile = async () => {
      if (requestedType !== 'user') {
        setPublicUser(null);
        return;
      }

      if (isOwnUserProfile) {
        setPublicUser(null);
        setLoadError(null);
        setIsLoading(false);
        return;
      }

      if (!requestedUserId) {
        setPublicUser(null);
        setLoadError('Perfil de usuario sem identificador.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        const nextUser = await userService.getPublicProfile(requestedUserId);

        if (!isMounted) {
          return;
        }

        setPublicUser(nextUser);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof Error ? error.message : 'Falha ao carregar o perfil do usuario.';
        setLoadError(message);
        setPublicUser(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadPublicUserProfile();

    return () => {
      isMounted = false;
    };
  }, [isOwnUserProfile, requestedType, requestedUserId]);

  const mediaUrls = useMemo(() => getMediaUrls(establishment), [establishment]);
  const openingHoursRows = useMemo(
    () => getOpeningHoursRows(establishment?.openingHours ?? null),
    [establishment?.openingHours]
  );

  const handleOpenCatalog = () => {
    if (!establishment) {
      return;
    }

    navigation.getParent()?.navigate('Catalog', {
      establishmentId: establishment.id,
      establishmentName: establishment.name,
      template: 'produto',
    });
  };

  const handleOpenProductManagement = () => {
    if (!establishment || !isOwnerEstablishmentView) {
      return;
    }

    navigation.getParent()?.navigate('ProductManagement', {
      establishmentId: establishment.id,
      establishmentName: establishment.name,
    });
  };

  const handleOpenProduct = (product: CatalogProduct) => {
    if (!establishment) {
      return;
    }

    navigation.getParent()?.navigate('Item', {
      template: 'produto',
      productId: product.id,
      establishmentId: establishment.id,
      establishmentName: establishment.name,
    });
  };

  const handleToggleFavorite = async () => {
    if (!establishment || isOwnerEstablishmentView || isUpdatingFavorite) {
      return;
    }

    setIsUpdatingFavorite(true);

    try {
      const response = isFavorite
        ? await locationService.unfavoriteEstablishment(establishment.id)
        : await locationService.favoriteEstablishment(establishment.id);

      const nextIsFavorite = !isFavorite;
      setIsFavorite(nextIsFavorite);
      setEstablishment((current) =>
        current
          ? {
              ...current,
              isFavorited: nextIsFavorite,
              favoritesCount: response.favoriteCount,
              favorites: response.favoriteCount,
            }
          : current,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nao foi possivel atualizar favorito.';
      Alert.alert('Favorito nao atualizado', message);
    } finally {
      setIsUpdatingFavorite(false);
    }
  };

  const handleOpenMaps = () => {
    if (!establishment) {
      return;
    }

    const query =
      establishment.address.trim().length > 0
        ? encodeURIComponent(establishment.address)
        : encodeURIComponent(`${establishment.latitude},${establishment.longitude}`);

    void openExternalUrl(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  const renderUserProfile = () => {
    if (!isOwnUserProfile && isLoading) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (!isOwnUserProfile && (loadError || !publicUser)) {
      return (
        <View style={styles.centerState}>
          <Text style={styles.emptyTitle}>Perfil indisponivel</Text>
          <Text style={styles.emptyText}>
            {loadError || 'Nao foi possivel localizar este usuario.'}
          </Text>
        </View>
      );
    }

    const profileName = publicUser?.name || user?.name || 'Sua conta';
    const avatarUrl = publicUser?.avatar || user?.avatar;
    const subtitle = publicUser
      ? publicUser.username
        ? `@${publicUser.username}`
        : publicUser.location || 'Perfil publico'
      : user?.email || 'Sem email cadastrado';
    const bio = publicUser?.bio || null;
    const location = publicUser?.location || null;
    const website = publicUser?.website || null;
    const hasPublicInfo = Boolean(bio || location || website || (!publicUser && user?.email));

    return (
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={[styles.avatar, styles.avatarCircular]}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.avatar, styles.avatarCircular]}>
              <Text style={styles.avatarFallback}>{getInitials(profileName)}</Text>
            </View>
          )}

          <View style={styles.identityBlock}>
            <Text style={styles.profileName}>{profileName}</Text>
            <Text style={styles.profileSubtitle}>{subtitle}</Text>
          </View>
        </View>

        {publicUser ? (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{publicUser.followersCount}</Text>
              <Text style={styles.statLabel}>Seguidores</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{publicUser.followingCount}</Text>
              <Text style={styles.statLabel}>Seguindo</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{publicUser.postsCount}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>
            {publicUser ? 'Informacoes publicas' : 'Dados da conta'}
          </Text>
          {hasPublicInfo ? (
            <>
              {!publicUser && user?.email ? renderInfoRow('Email', user.email) : null}
              {bio ? renderInfoRow('Bio', bio) : null}
              {location ? renderInfoRow('Localidade', location) : null}
              {website ? (
                <TouchableOpacity style={styles.catalogButton} onPress={() => void openExternalUrl(website)}>
                  <Text style={styles.catalogButtonText}>Abrir website</Text>
                </TouchableOpacity>
              ) : null}
            </>
          ) : (
            <Text style={styles.cardText}>Sem informacoes publicas.</Text>
          )}
        </View>
      </ScrollView>
    );
  };

  const renderInfoRow = (label: string, value: string) => (
    <View style={styles.infoRow} key={label}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  const renderProductsPreview = () => {
    if (products.length === 0) {
      return (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Nenhum item publicado</Text>
          <Text style={styles.emptyText}>
            Esta vitrine ainda nao possui produtos ativos publicados.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.productList}>
        {products.slice(0, 6).map((product) => (
          <TouchableOpacity
            key={product.id}
            style={styles.productCard}
            activeOpacity={0.85}
            onPress={() => handleOpenProduct(product)}
          >
            <View style={styles.productMedia}>
              {product.imageUrl || product.mainImageUrl ? (
                <Image
                  source={{ uri: product.imageUrl || product.mainImageUrl || undefined }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.productFallback}>PRD</Text>
              )}
            </View>

            <View style={styles.productBody}>
              <Text style={styles.productName} numberOfLines={1}>
                {product.name}
              </Text>
              <Text style={styles.productCategory} numberOfLines={1}>
                {product.category || 'Produto'}
              </Text>
              <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.catalogButton} onPress={handleOpenCatalog}>
          <Text style={styles.catalogButtonText}>Ver vitrine completa</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEstablishmentContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (loadError || !establishment) {
      return (
        <View style={styles.centerState}>
          <Text style={styles.emptyTitle}>Perfil indisponivel</Text>
          <Text style={styles.emptyText}>
            {loadError || 'Nao foi possivel localizar a pagina deste estabelecimento.'}
          </Text>
        </View>
      );
    }

    const whatsappUrl = establishment.whatsapp
      ? `https://wa.me/${establishment.whatsapp.replace(/\D/g, '')}`
      : null;

    return (
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          {establishment.logoUrl || establishment.image ? (
            <Image
              source={{ uri: establishment.logoUrl || establishment.image || undefined }}
              style={[styles.avatar, styles.avatarSquare]}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.avatar, styles.avatarSquare]}>
              <Text style={styles.avatarFallback}>{getInitials(establishment.name)}</Text>
            </View>
          )}

          <View style={styles.identityBlock}>
            <Text style={styles.profileName}>{establishment.name}</Text>
            <Text style={styles.profileSubtitle}>
              {establishment.category}
              {establishment.subcategory ? ` · ${establishment.subcategory}` : ''}
            </Text>
            <Text style={styles.profileCaption}>
              {isOwnerEstablishmentView ? 'Sua pagina publica' : formatDistance(establishment.distanceKm)}
            </Text>
            {establishment.isOpenNow ? <Text style={styles.badge}>ABERTO AGORA</Text> : null}
          </View>
        </View>

        {establishment.description ? (
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Descricao</Text>
            <Text style={styles.cardText}>{establishment.description}</Text>
          </View>
        ) : null}

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{establishment.rating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Nota</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{establishment.reviewsCount}</Text>
            <Text style={styles.statLabel}>Aval.</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{products.length}</Text>
            <Text style={styles.statLabel}>Itens</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{establishment.favoritesCount}</Text>
            <Text style={styles.statLabel}>Favoritos</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          {!isOwnerEstablishmentView ? (
            <TouchableOpacity
              style={[styles.actionChip, isFavorite && styles.actionChipActive]}
              onPress={handleToggleFavorite}
              disabled={isUpdatingFavorite}
            >
              <Text style={[styles.actionChipText, isFavorite && styles.actionChipTextActive]}>
                {isFavorite ? 'Salvo' : 'Salvar'}
              </Text>
            </TouchableOpacity>
          ) : null}
          {establishment.phone ? (
            <TouchableOpacity
              style={styles.actionChip}
              onPress={() => void openExternalUrl(`tel:${establishment.phone}`)}
            >
              <Text style={styles.actionChipText}>Ligar</Text>
            </TouchableOpacity>
          ) : null}
          {whatsappUrl ? (
            <TouchableOpacity
              style={styles.actionChip}
              onPress={() => void openExternalUrl(whatsappUrl)}
            >
              <Text style={styles.actionChipText}>WhatsApp</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.actionChip} onPress={handleOpenMaps}>
            <Text style={styles.actionChipText}>Como chegar</Text>
          </TouchableOpacity>
          {establishment.website ? (
            <TouchableOpacity
              style={styles.actionChip}
              onPress={() => void openExternalUrl(establishment.website as string)}
            >
              <Text style={styles.actionChipText}>Website</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.tabsRow}>
          {ESTABLISHMENT_TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, active && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {activeTab === 'Tudo' ? (
          <View style={styles.sectionStack}>
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Informacoes publicas</Text>
              {renderInfoRow('Endereco', establishment.address)}
              {establishment.phone ? renderInfoRow('Telefone', establishment.phone) : null}
              {establishment.whatsapp ? renderInfoRow('WhatsApp', establishment.whatsapp) : null}
              {establishment.website ? renderInfoRow('Website', establishment.website) : null}
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Horario</Text>
              {openingHoursRows.length > 0 ? (
                openingHoursRows.map((row) => renderInfoRow(row.label, row.value))
              ) : (
                <Text style={styles.cardText}>Horario ainda nao informado.</Text>
              )}
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Acesso rapido</Text>
              <TouchableOpacity style={styles.catalogButton} onPress={handleOpenCatalog}>
                <Text style={styles.catalogButtonText}>Abrir vitrine publica</Text>
              </TouchableOpacity>
              {isOwnerEstablishmentView ? (
                <TouchableOpacity style={styles.catalogButton} onPress={handleOpenProductManagement}>
                  <Text style={styles.catalogButtonText}>Gerenciar vitrine</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ) : null}

        {activeTab === 'Midia' ? (
          mediaUrls.length > 0 ? (
            <View style={styles.mediaGrid}>
              {mediaUrls.map((uri) => (
                <Image key={uri} source={{ uri }} style={styles.mediaGridItem} resizeMode="cover" />
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Sem midia publicada</Text>
              <Text style={styles.emptyText}>
                Este perfil ainda nao possui logo, capa ou fotos de galeria publicadas.
              </Text>
            </View>
          )
        ) : null}

        {activeTab === 'Avaliacoes' ? (
          establishment.reviewsPreview.length > 0 ? (
            <View style={styles.reviewList}>
              {establishment.reviewsPreview.map((review: Review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewAuthor}>{review.author.name}</Text>
                    <Text style={styles.reviewRating}>Nota {review.rating.toFixed(1)}</Text>
                  </View>
                  <Text style={styles.reviewText}>{review.comment || review.content || 'Sem comentario.'}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Sem avaliacoes ainda</Text>
              <Text style={styles.emptyText}>
                Quando o estabelecimento receber avaliacoes publicas, elas aparecerao aqui.
              </Text>
            </View>
          )
        ) : null}

        {activeTab === 'Servicos' ? renderProductsPreview() : null}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {requestedType === 'establishment' ? renderEstablishmentContent() : renderUserProfile()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: componentSizes.avatarXL,
    height: componentSizes.avatarXL,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  avatarCircular: {
    borderRadius: componentSizes.avatarXL / 2,
  },
  avatarSquare: {
    borderRadius: spacing.md,
  },
  avatarFallback: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  identityBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  profileName: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '800',
  },
  profileSubtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  profileCaption: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
  },
  badge: {
    alignSelf: 'flex-start',
    color: colors.text,
    backgroundColor: colors.success,
    borderRadius: 10,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  actionChipActive: {
    borderColor: colors.primary,
    backgroundColor: '#2E1405',
  },
  actionChipText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  actionChipTextActive: {
    color: colors.text,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  tabButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tabButtonActive: {
    borderColor: colors.primary,
    backgroundColor: '#1A0F05',
  },
  tabButtonText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  tabButtonTextActive: {
    color: colors.primary,
  },
  sectionStack: {
    gap: spacing.md,
  },
  infoCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  cardText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  infoRow: {
    gap: spacing.xs,
  },
  infoLabel: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  infoValue: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  mediaGridItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  emptyCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 18,
  },
  reviewList: {
    gap: spacing.sm,
  },
  reviewCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  reviewAuthor: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  reviewRating: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  reviewText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  productList: {
    gap: spacing.sm,
  },
  productCard: {
    flexDirection: 'row',
    gap: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.sm,
  },
  productMedia: {
    width: 72,
    height: 72,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productFallback: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  productBody: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  productName: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  productCategory: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
  productPrice: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  catalogButton: {
    marginTop: spacing.sm,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catalogButtonText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
});
