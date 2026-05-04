import { ParamListBase, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors } from '@constants/colors';
import { spacing, fontSize } from '@constants/design';
import {
  activityHistoryService,
  type ActivityCheckInHistoryItem,
  type ActivityHistorySnapshot,
  type ActivitySearchHistoryItem,
  type ActivityViewedHistoryItem,
} from '@services/activity/ActivityHistoryService';
import { ScreenHeader } from '@components';

type HistoryRow =
  | ActivityCheckInHistoryItem
  | ActivitySearchHistoryItem
  | ActivityViewedHistoryItem;

type HistorySection = {
  id: 'checkins' | 'searches' | 'viewed';
  title: string;
  emptyText: string;
  data: HistoryRow[];
};

const emptySnapshot: ActivityHistorySnapshot = {
  checkins: [],
  searches: [],
  viewed: [],
};

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
};

export default function ActivityHistoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [history, setHistory] = useState<ActivityHistorySnapshot>(emptySnapshot);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setHistory(await activityHistoryService.getHistory());
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar o historico.';
      setError(message);
      setHistory(emptySnapshot);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadHistory();
    }, [loadHistory])
  );

  const sections: HistorySection[] = useMemo(
    () => [
      {
        id: 'checkins',
        title: 'Check-ins',
        emptyText: 'Nenhum check-in registrado neste dispositivo.',
        data: history.checkins,
      },
      {
        id: 'searches',
        title: 'Buscas recentes',
        emptyText: 'Suas buscas feitas no app aparecerao aqui.',
        data: history.searches,
      },
      {
        id: 'viewed',
        title: 'Vistos recentemente',
        emptyText: 'Perfis e itens abertos aparecerao aqui.',
        data: history.viewed,
      },
    ],
    [history]
  );

  const totalItems = sections.reduce((total, section) => total + section.data.length, 0);

  const closeEditing = () => {
    setIsEditing(false);
    setSelectedIds(new Set());
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const allIds = sections.flatMap((section) => section.data.map((item) => item.id));
    setSelectedIds(new Set(allIds));
  };

  const handleDeleteSelected = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      return;
    }

    await activityHistoryService.removeItems(ids);
    closeEditing();
    await loadHistory();
  };

  const handleOpenRow = (item: HistoryRow) => {
    if (isEditing) {
      toggleSelected(item.id);
      return;
    }

    if (item.type === 'search') {
      navigation.getParent()?.navigate('Search', { initialQuery: item.query });
      return;
    }

    if (item.type === 'checkin') {
      navigation.getParent()?.navigate('Profile', {
        type: 'establishment',
        establishmentId: item.placeId,
      });
      return;
    }

    if (item.targetType === 'establishment') {
      navigation.getParent()?.navigate('Profile', {
        type: 'establishment',
        establishmentId: item.targetId,
      });
      return;
    }

    navigation.getParent()?.getParent()?.navigate('Item', {
      template: item.targetType === 'event' ? 'evento' : 'produto',
      productId: item.targetType === 'product' ? item.targetId : undefined,
      establishmentId: item.establishmentId,
      establishmentName: item.establishmentName,
      item:
        item.targetType === 'event'
          ? {
              id: item.targetId,
              name: item.title,
              description: '',
              category: item.meta || 'Evento',
              price: '',
            }
          : undefined,
    });
  };

  const getRowTitle = (item: HistoryRow) => {
    if (item.type === 'search') {
      return item.query;
    }

    if (item.type === 'checkin') {
      return item.name;
    }

    return item.title;
  };

  const getRowMeta = (item: HistoryRow) => {
    if (item.type === 'search') {
      return 'Busca';
    }

    return item.meta || 'Atividade';
  };

  const renderRow = ({ item }: { item: HistoryRow }) => {
    const isSelected = selectedIds.has(item.id);

    return (
      <TouchableOpacity
        style={styles.historyRow}
        activeOpacity={0.85}
        onPress={() => handleOpenRow(item)}
        accessibilityRole="button"
      >
        {isEditing ? (
          <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
            <Text style={styles.checkboxText}>{isSelected ? 'X' : ''}</Text>
          </View>
        ) : null}

        <View style={styles.rowIcon}>
          <Text style={styles.rowIconText}>
            {item.type === 'search' ? 'B' : item.type === 'checkin' ? 'C' : 'V'}
          </Text>
        </View>

        <View style={styles.rowText}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {getRowTitle(item)}
          </Text>
          <Text style={styles.rowMeta} numberOfLines={1}>
            {getRowMeta(item)}
          </Text>
        </View>

        <Text style={styles.rowDate}>{formatDate(item.createdAt)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {isEditing ? (
        <View style={styles.header}>
          <TouchableOpacity onPress={closeEditing} accessibilityRole="button">
            <Text style={styles.headerAction}>Cancelar</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Selecionar</Text>

          <TouchableOpacity onPress={handleSelectAll} accessibilityRole="button">
            <Text style={styles.headerAction}>Tudo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScreenHeader
          title="Historico"
          onBack={() => navigation.goBack()}
          rightLabel={totalItems > 0 ? 'Editar' : undefined}
          onRightPress={totalItems > 0 ? () => setIsEditing(true) : undefined}
        />
      )}

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.centerText}>Carregando historico...</Text>
        </View>
      ) : error ? (
        <View style={styles.content}>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Historico indisponivel</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => void loadHistory()}>
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : totalItems === 0 ? (
        <View style={styles.content}>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nenhum historico ainda</Text>
            <Text style={styles.emptyText}>
              Buscas e itens visualizados neste dispositivo aparecerao aqui.
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {sections.map((section) => (
            <View key={section.id} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.data.length > 0 ? (
                <FlatList
                  data={section.data}
                  renderItem={renderRow}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              ) : (
                <Text style={styles.sectionEmpty}>{section.emptyText}</Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {isEditing ? (
        <View style={styles.editFooter}>
          <Text style={styles.selectedText}>{selectedIds.size} selecionados</Text>
          <TouchableOpacity
            style={[styles.deleteButton, selectedIds.size === 0 && styles.deleteButtonDisabled]}
            onPress={() => void handleDeleteSelected()}
            disabled={selectedIds.size === 0}
            accessibilityRole="button"
          >
            <Text style={styles.deleteButtonText}>Excluir</Text>
          </TouchableOpacity>
        </View>
      ) : null}
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.lg,
    fontWeight: '900',
    color: colors.text,
  },
  headerAction: {
    minWidth: 44,
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '800',
    textAlign: 'center',
  },
  content: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  sectionEmpty: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  checkboxText: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: '900',
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '900',
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '800',
  },
  rowMeta: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  rowDate: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  centerText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  emptyCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.md,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '800',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  retryButton: {
    alignSelf: 'flex-start',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  retryButtonText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  editFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  selectedText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  deleteButton: {
    borderRadius: 18,
    backgroundColor: '#E74C3C',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  deleteButtonDisabled: {
    opacity: 0.45,
  },
  deleteButtonText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
});
