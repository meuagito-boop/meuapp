import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ParamListBase, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { HeaderBackButton } from '@components';
import { colors } from '@constants/colors';
import { fontSize, spacing } from '@constants/design';
import { catalogService, locationService } from '@services/api';
import { activityHistoryService } from '@services/activity/ActivityHistoryService';
import type { CatalogProduct } from '@services/api/CatalogService';
import type { Event } from '@services/api/LocationService';

type ItemTemplate =
  | 'prato'
  | 'produto'
  | 'quarto'
  | 'plano'
  | 'procedimento'
  | 'servico'
  | 'evento';

type GenericItemPayload = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  badge?: string;
  fallbackLabel?: string;
  imageUrl?: string;
};

type ItemRouteParams = {
  template?: ItemTemplate;
  productId?: string;
  establishmentId?: string;
  establishmentName?: string;
  item?: GenericItemPayload;
};

const formatPrice = (value?: number | null) => {
  if (value == null) {
    return 'Consulte';
  }

  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

const formatEventDate = (value?: string) => {
  if (!value) {
    return 'Data nao informada';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatTimeWindow = (startTime?: string, endTime?: string) => {
  if (!startTime && !endTime) {
    return 'Horario nao informado';
  }

  if (startTime && endTime) {
    return `${startTime} - ${endTime}`;
  }

  return startTime || endTime || 'Horario nao informado';
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

export default function ItemScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<ParamListBase, string>>();
  const routeParams = route.params as ItemRouteParams | undefined;

  const template: ItemTemplate = routeParams?.template ?? 'servico';
  const genericItem = routeParams?.item ?? null;

  const [expandedDescription, setExpandedDescription] = useState(false);
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [isLoadingEvent, setIsLoadingEvent] = useState(false);
  const [isSubmittingEventAction, setIsSubmittingEventAction] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);
  const [eventError, setEventError] = useState<string | null>(null);

  const resolvedProductId = routeParams?.productId ?? genericItem?.id;
  const resolvedEventId = genericItem?.id;

  useEffect(() => {
    setExpandedDescription(false);
  }, [genericItem?.id, resolvedProductId, resolvedEventId, template]);

  useEffect(() => {
    if (template !== 'produto' || !resolvedProductId) {
      setProduct(null);
      setProductError(null);
      setIsLoadingProduct(false);
      return;
    }

    let isMounted = true;
    setIsLoadingProduct(true);
    setProductError(null);

    catalogService
      .getProduct(resolvedProductId)
      .then((response) => {
        if (isMounted) {
          setProduct(response);
        }
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        const message = error instanceof Error ? error.message : 'Falha ao carregar o produto.';
        setProductError(message);
        setProduct(null);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingProduct(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [resolvedProductId, template]);

  useEffect(() => {
    if (template !== 'evento' || !resolvedEventId) {
      setEvent(null);
      setEventError(null);
      setIsLoadingEvent(false);
      return;
    }

    let isMounted = true;
    setIsLoadingEvent(true);
    setEventError(null);

    locationService
      .getEvent(resolvedEventId)
      .then((response) => {
        if (isMounted) {
          setEvent(response);
        }
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        const message = error instanceof Error ? error.message : 'Falha ao carregar o evento.';
        setEventError(message);
        setEvent(null);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingEvent(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [resolvedEventId, template]);

  useEffect(() => {
    if (template === 'produto' && product) {
      void activityHistoryService.recordViewed({
        targetType: 'product',
        targetId: product.id,
        title: product.name,
        meta: product.category || 'Produto',
        establishmentId: product.establishment?.id ?? routeParams?.establishmentId,
        establishmentName: product.establishment?.name ?? routeParams?.establishmentName,
      });
      return;
    }

    if (template === 'evento' && event) {
      void activityHistoryService.recordViewed({
        targetType: 'event',
        targetId: event.id,
        title: event.name || event.title,
        meta: event.category || 'Evento',
      });
    }
  }, [event, product, routeParams?.establishmentId, routeParams?.establishmentName, template]);

  const productEstablishmentId = product?.establishment?.id ?? routeParams?.establishmentId;
  const productEstablishmentName =
    product?.establishment?.name ?? routeParams?.establishmentName ?? 'Estabelecimento';

  const productStatusText = useMemo(() => {
    if (!product) {
      return '';
    }

    if (product.status === 'OUT_OF_STOCK') {
      return 'Sem estoque no momento';
    }

    if (product.status === 'INACTIVE') {
      return 'Produto fora da vitrine';
    }

    return 'Produto ativo na vitrine publica';
  }, [product]);

  const handleOpenEstablishment = () => {
    if (!productEstablishmentId) {
      navigation.goBack();
      return;
    }

    navigation.navigate('MainTabs', {
      screen: 'Profile',
      params: {
        type: 'establishment',
        establishmentId: productEstablishmentId,
      },
    });
  };

  const handleEventAction = async () => {
    if (!event) {
      return;
    }

    setIsSubmittingEventAction(true);

    try {
      const response = event.isAttending
        ? await locationService.cancelAttendance(event.id)
        : await locationService.attendEvent(event.id);

      setEvent((current) =>
        current
          ? {
              ...current,
              isAttending: !current.isAttending,
              attendeesCount: response.attendeeCount,
              attendees: response.attendeeCount,
            }
          : current,
      );

      Alert.alert(
        event.isAttending ? 'Presenca cancelada' : 'Presenca confirmada',
        response.message,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao atualizar presenca.';

      if (message.toLowerCase().includes('already attending')) {
        setEvent((current) =>
          current
            ? {
                ...current,
                isAttending: true,
              }
            : current,
        );
      }

      Alert.alert('Falha ao atualizar presenca', message);
    } finally {
      setIsSubmittingEventAction(false);
    }
  };

  const renderHeader = (title: string) => (
    <View style={styles.header}>
      <HeaderBackButton onPress={() => navigation.goBack()} />

      <Text numberOfLines={1} style={styles.headerTitle}>
        {title}
      </Text>

      <View style={styles.headerGhost} />
    </View>
  );

  if (template === 'produto') {
    if (isLoadingProduct) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.centerText}>Carregando produto da vitrine...</Text>
        </View>
      );
    }

    if (productError || !product) {
      return (
        <View style={styles.centerState}>
          <Text style={styles.errorTitle}>Produto indisponivel</Text>
          <Text style={styles.centerText}>
            {productError || 'Nao foi possivel carregar este item.'}
          </Text>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <Text style={styles.primaryActionText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        {renderHeader(product.name)}

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.gallery}>
            {product.imageUrl || product.mainImageUrl ? (
              <Image
                source={{ uri: product.imageUrl || product.mainImageUrl || undefined }}
                resizeMode="cover"
                style={styles.galleryImage}
              />
            ) : (
              <Text style={styles.galleryFallback}>PRD</Text>
            )}
          </View>

          <Text style={styles.itemName}>{product.name}</Text>
          <Text style={styles.itemCategory}>{product.category || 'Produto'}</Text>

          {product.description ? (
            <>
              <Text style={styles.itemDescription} numberOfLines={expandedDescription ? undefined : 4}>
                {product.description}
              </Text>
              {product.description.length > 180 ? (
                <TouchableOpacity
                  onPress={() => setExpandedDescription((current) => !current)}
                  accessibilityRole="button"
                  accessibilityLabel={expandedDescription ? 'Mostrar menos descricao' : 'Mostrar mais descricao'}
                >
                  <Text style={styles.linkText}>{expandedDescription ? 'Ver menos' : 'Ver mais'}</Text>
                </TouchableOpacity>
              ) : null}
            </>
          ) : (
            <Text style={styles.itemDescription}>Sem descricao publicada para este item.</Text>
          )}

          <TouchableOpacity
            style={styles.sectionCard}
            onPress={handleOpenEstablishment}
            accessibilityRole="button"
            accessibilityLabel="Abrir estabelecimento"
          >
            <Text style={styles.sectionLabel}>Estabelecimento</Text>
            <Text style={styles.sectionValue}>{productEstablishmentName}</Text>
          </TouchableOpacity>

          <View style={styles.priceCard}>
            <Text style={styles.sectionLabel}>Preco publico</Text>
            <Text style={styles.priceValue}>{formatPrice(product.price)}</Text>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>Status da vitrine</Text>
            <Text style={styles.sectionText}>{productStatusText}</Text>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        <View style={styles.actionFooter}>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={handleOpenEstablishment}
            accessibilityRole="button"
            accessibilityLabel="Abrir estabelecimento"
          >
            <Text style={styles.primaryActionText}>Ver estabelecimento</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (template === 'evento') {
    if (isLoadingEvent) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.centerText}>Carregando evento...</Text>
        </View>
      );
    }

    if (eventError || !event) {
      return (
        <View style={styles.centerState}>
          <Text style={styles.errorTitle}>Evento indisponivel</Text>
          <Text style={styles.centerText}>{eventError || 'Nao foi possivel carregar este evento.'}</Text>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <Text style={styles.primaryActionText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const eventTitle = event.name || event.title;
    const eventDate = formatEventDate(event.date || event.startDate);
    const eventTime = formatTimeWindow(event.startTime, event.endTime);
    const eventLocation =
      event.address.trim().length > 0
        ? event.address
        : `${event.latitude.toFixed(5)}, ${event.longitude.toFixed(5)}`;

    return (
      <View style={styles.container}>
        {renderHeader(eventTitle)}

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.gallery}>
            {event.image ? (
              <Image source={{ uri: event.image }} resizeMode="cover" style={styles.galleryImage} />
            ) : (
              <Text style={styles.galleryFallback}>EVT</Text>
            )}
          </View>

          <Text style={styles.itemName}>{eventTitle}</Text>
          <Text style={styles.itemCategory}>{event.category || 'Evento'}</Text>

          <Text style={styles.itemDescription} numberOfLines={expandedDescription ? undefined : 4}>
            {event.description || 'Evento sem descricao publicada.'}
          </Text>
          {event.description && event.description.length > 180 ? (
            <TouchableOpacity
              onPress={() => setExpandedDescription((current) => !current)}
              accessibilityRole="button"
              accessibilityLabel={expandedDescription ? 'Mostrar menos descricao' : 'Mostrar mais descricao'}
            >
              <Text style={styles.linkText}>{expandedDescription ? 'Ver menos' : 'Ver mais'}</Text>
            </TouchableOpacity>
          ) : null}

          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Data</Text>
              <Text style={styles.metricValue}>{eventDate}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Horario</Text>
              <Text style={styles.metricValue}>{eventTime}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Presencas</Text>
              <Text style={styles.metricValue}>{event.attendeesCount}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Distancia</Text>
              <Text style={styles.metricValue}>{formatDistance(event.distanceKm)}</Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>Organizacao</Text>
            <Text style={styles.sectionValue}>{event.organizer?.name || event.creator.name}</Text>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>Local</Text>
            <Text style={styles.sectionText}>{eventLocation}</Text>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>Capacidade</Text>
            <Text style={styles.sectionText}>
              {event.maxAttendees
                ? `${event.attendeesCount} / ${event.maxAttendees} confirmados`
                : `${event.attendeesCount} confirmados ate agora`}
            </Text>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        <View style={styles.actionFooter}>
          <TouchableOpacity
            style={[
              styles.primaryAction,
              event.isAttending ? styles.secondaryAction : null,
              isSubmittingEventAction ? styles.primaryActionDisabled : null,
            ]}
            disabled={isSubmittingEventAction}
            onPress={handleEventAction}
            accessibilityRole="button"
            accessibilityLabel={event.isAttending ? 'Cancelar presenca no evento' : 'Confirmar presenca no evento'}
          >
            <Text
              style={[
                styles.primaryActionText,
                event.isAttending ? styles.secondaryActionText : null,
              ]}
            >
              {isSubmittingEventAction
                ? 'Atualizando...'
                : event.isAttending
                ? 'Cancelar presenca'
                : 'Confirmar presenca'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.centerState}>
      <Text style={styles.errorTitle}>Item indisponivel</Text>
      <Text style={styles.centerText}>
        Nao foi possivel abrir este item. Acesse por uma vitrine publicada ou pela lista de eventos.
      </Text>
      <TouchableOpacity
        style={styles.primaryAction}
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
      >
        <Text style={styles.primaryActionText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  centerText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 18,
  },
  errorTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerGhost: {
    width: 44,
    height: 44,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  gallery: {
    marginTop: spacing.md,
    minHeight: 240,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  galleryFallback: {
    color: colors.textSecondary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  galleryBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    color: colors.text,
    backgroundColor: colors.primary,
    borderRadius: 10,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  itemName: {
    color: colors.text,
    fontSize: fontSize.huge,
    fontWeight: '600',
  },
  itemCategory: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    textTransform: 'capitalize',
  },
  itemDescription: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 21,
  },
  linkText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricCard: {
    flexBasis: '47%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.xs,
  },
  metricLabel: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metricValue: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  priceCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.xs,
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionLabel: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  sectionValue: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  sectionText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  priceValue: {
    color: colors.primary,
    fontSize: fontSize.huge,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 70,
  },
  actionFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  primaryAction: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryAction: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryActionDisabled: {
    opacity: 0.7,
  },
  primaryActionText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  secondaryActionText: {
    color: colors.primary,
  },
});
