import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors } from '@constants/colors';
import { spacing, fontSize, componentSizes } from '@constants/design';

/**
 * ActivityHistoryScreen - T_ATIVIDADE_HISTORICO
 * Registro cronológico das ações do usuário
 * Sub-seções: Check-ins, Buscas, Vistos
 * Fase 1.0: Apenas Check-ins, Buscas e Vistos
 * Fase 1.2+: Pedidos, Agendamentos, Reservas
 */

interface HistorySection {
  id: string;
  title: string;
  icon: string;
  items: HistoryItem[];
  visible: boolean; // true for Phase 1.0, false for 1.2+
}

interface HistoryItem {
  id: string;
  title: string;
  meta: string;
  timestamp: Date;
  emoji: string;
}

const MOCK_HISTORY: HistorySection[] = [
  {
    id: 'checkins',
    title: 'Check-ins',
    icon: '📍',
    visible: true,
    items: [
      {
        id: 'c1',
        title: 'Pizzaria Do Nino',
        meta: 'Restaurante',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        emoji: '🍕',
      },
      {
        id: 'c2',
        title: 'Parque Central',
        meta: 'Lazer',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        emoji: '🌳',
      },
      {
        id: 'c3',
        title: 'Barbearia Vintage',
        meta: 'Serviço',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        emoji: '💈',
      },
    ],
  },
  {
    id: 'searches',
    title: 'Buscas recentes',
    icon: '🔍',
    visible: true,
    items: [
      {
        id: 's1',
        title: 'Pizza',
        meta: 'Termo buscado',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        emoji: '🔍',
      },
      {
        id: 's2',
        title: 'Barbearia',
        meta: 'Termo buscado',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
        emoji: '🔍',
      },
      {
        id: 's3',
        title: 'Cinema',
        meta: 'Termo buscado',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
        emoji: '🔍',
      },
    ],
  },
  {
    id: 'viewed',
    title: 'Vistos recentemente',
    icon: '👁',
    visible: true,
    items: [
      {
        id: 'v1',
        title: 'João Silva',
        meta: 'Perfil visualizado',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        emoji: '👤',
      },
      {
        id: 'v2',
        title: 'Café Ponto',
        meta: 'Perfil visualizado',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
        emoji: '☕',
      },
    ],
  },
  {
    id: 'orders',
    title: 'Pedidos',
    icon: '🛒',
    visible: false,
    items: [],
  },
  {
    id: 'appointments',
    title: 'Agendamentos',
    icon: '📅',
    visible: false,
    items: [],
  },
  {
    id: 'reservations',
    title: 'Reservas',
    icon: '🏨',
    visible: false,
    items: [],
  },
];

export default function ActivityHistoryScreen() {
  const navigation = useNavigation<any>();
  const [editMode, setEditMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [history, setHistory] = useState<HistorySection[]>(MOCK_HISTORY);

  useFocusEffect(
    useCallback(() => {
      // Reset state when screen is focused
      setEditMode(false);
      setSelectedItems([]);
    }, []),
  );

  const visibleSections = history.filter((section) => section.visible);
  const allVisibleItems = visibleSections.flatMap((section) =>
    section.items.map((item) => ({ ...item, sectionId: section.id })),
  );

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === allVisibleItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(allVisibleItems.map((item) => item.id));
    }
  };

  const handleDeleteItems = () => {
    if (selectedItems.length === 0) {
      Alert.alert('Nenhum item selecionado');
      return;
    }

    Alert.alert(
      'Remover itens',
      `Deseja remover ${selectedItems.length} item(ns) do histórico?`,
      [
        { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
        {
          text: 'Remover',
          onPress: () => {
            setHistory((prev) =>
              prev.map((section) => ({
                ...section,
                items: section.items.filter((item) => !selectedItems.includes(item.id)),
              })),
            );
            setSelectedItems([]);
            Alert.alert('✓ Itens removidos com sucesso');
          },
          style: 'destructive',
        },
      ],
    );
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'Ontem';
    return date.toLocaleDateString('pt-BR');
  };

  const renderHistoryItem = ({
    item,
    sectionId,
  }: {
    item: HistoryItem;
    sectionId: string;
  }) => {
    const isSelected = selectedItems.includes(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.historyItem,
          isSelected && styles.historyItemSelected,
        ]}
        activeOpacity={0.7}
        onPress={() => {
          if (editMode) {
            handleSelectItem(item.id);
          }
          // Navigate to detail based on section type
        }}
      >
        {editMode && (
          <View
            style={[
              styles.checkbox,
              isSelected && styles.checkboxChecked,
            ]}
          >
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </View>
        )}

        <View style={styles.itemIcon}>
          <Text style={styles.itemEmoji}>{item.emoji}</Text>
        </View>

        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.itemMeta} numberOfLines={1}>
            {item.meta}
          </Text>
        </View>

        <Text style={styles.itemTime}>{formatTime(item.timestamp)}</Text>
      </TouchableOpacity>
    );
  };

  const renderSection = (section: HistorySection) => {
    if (!section.visible || section.items.length === 0) return null;

    return (
      <View key={section.id} style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>{section.icon}</Text>
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>

        {section.items.map((item) => (
          <View key={item.id}>
            {renderHistoryItem({ item, sectionId: section.id })}
          </View>
        ))}
      </View>
    );
  };

  const emptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>Nenhum histórico ainda</Text>
      <Text style={styles.emptySubtitle}>
        Seu histórico de atividades aparecerá aqui
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico</Text>
        <TouchableOpacity onPress={() => setEditMode(!editMode)}>
          <Text style={styles.headerAction}>
            {editMode ? 'Cancelar' : 'Editar'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* History List */}
      {allVisibleItems.length === 0 ? (
        emptyState()
      ) : (
        <>
          <FlatList
            data={visibleSections}
            renderItem={({ item }) => renderSection(item)}
            keyExtractor={(item) => item.id}
            scrollEnabled={true}
            contentContainerStyle={styles.listContent}
          />

          {editMode && (
            <View style={styles.editFooter}>
              <TouchableOpacity
                style={styles.selectAllButton}
                onPress={handleSelectAll}
              >
                <Text style={styles.selectAllText}>
                  {selectedItems.length === allVisibleItems.length
                    ? 'Desselecionar tudo'
                    : 'Selecionar tudo'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  selectedItems.length === 0 && styles.deleteButtonDisabled,
                ]}
                onPress={handleDeleteItems}
                disabled={selectedItems.length === 0}
              >
                <Text style={styles.deleteButtonText}>
                  🗑️ Remover ({selectedItems.length})
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
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
  listContent: {
    paddingVertical: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  sectionIcon: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  historyItemSelected: {
    backgroundColor: colors.surface,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '700',
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemEmoji: {
    fontSize: 20,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  itemMeta: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  itemTime: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  editFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  selectAllButton: {
    paddingVertical: spacing.sm,
  },
  selectAllText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '700',
  },
  deleteButton: {
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deleteButtonText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
});
