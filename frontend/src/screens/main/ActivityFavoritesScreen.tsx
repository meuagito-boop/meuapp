import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '@constants/colors';
import { spacing, fontSize } from '@constants/design';

export default function ActivityFavoritesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.backButton}>
            <Text style={styles.backIcon}>{'<'}</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favoritos</Text>
        <View style={styles.headerGhost} />
      </View>

      <View style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroBadge}>STATUS REAL</Text>
          <Text style={styles.heroTitle}>Favoritos ainda nao sincronizados nesta tela</Text>
          <Text style={styles.heroText}>
            O app ja permite favoritar estabelecimento no perfil publico, mas esta tela ainda nao
            consome uma lista consolidada do backend. Os dados fake anteriores foram removidos para
            nao mascarar a lacuna.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>O que existe hoje</Text>
          <Text style={styles.cardText}>
            Favoritar e desfavoritar estabelecimento pelo endpoint real do modulo `establishments`.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>O que falta para fechar</Text>
          <Text style={styles.cardText}>
            Um endpoint dedicado para listar favoritos do usuario com contrato consumivel por esta
            tela, ou uma estrategia oficial para derivar essa lista sem duplicar regra de negocio.
          </Text>
        </View>

        <TouchableOpacity style={styles.primaryAction} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryActionText}>Voltar</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '700',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.lg,
    fontWeight: '900',
    color: colors.text,
  },
  headerGhost: {
    width: 34,
    height: 34,
  },
  content: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  hero: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  heroBadge: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  heroText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '800',
  },
  cardText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 19,
  },
  primaryAction: {
    marginTop: 'auto',
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryActionText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '800',
  },
});
