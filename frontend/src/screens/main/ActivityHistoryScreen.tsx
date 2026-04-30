import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '@constants/colors';
import { spacing, fontSize } from '@constants/design';

export default function ActivityHistoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.backButton}>
            <Text style={styles.backIcon}>{'<'}</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historico</Text>
        <View style={styles.headerGhost} />
      </View>

      <View style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroBadge}>STATUS REAL</Text>
          <Text style={styles.heroTitle}>Historico consolidado ainda nao existe no backend</Text>
          <Text style={styles.heroText}>
            Os dados locais fixos que simulavam check-ins, buscas e vistos foram removidos. O
            produto ainda nao tem um contrato unico de historico capaz de sustentar esta tela com
            consistencia de producao.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Lacuna confirmada</Text>
          <Text style={styles.cardText}>
            Nao foi encontrado endpoint canonico para consolidar buscas recentes, perfis vistos,
            check-ins ou atividades equivalentes nesta area.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Proximo passo correto</Text>
          <Text style={styles.cardText}>
            Definir primeiro o modelo oficial de historico e sua retencao. So depois vale ligar a
            interface, para evitar uma tela bonita sustentada por comportamento inventado.
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
