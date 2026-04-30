import { useFocusEffect, useNavigation, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

import { colors } from '@constants/colors';
import { spacing, fontSize } from '@constants/design';

/**
 * SettingsSecurity - Sub-tela de SeguranÃ§a
 * Tela 10 de T_CONFIG
 * Password, 2FA,Dispositivos, HistÃ³rico, Alertas
 */

export default function SettingsSecurityScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  useFocusEffect(
    useCallback(() => {
      // Load security settings
    }, []),
  );

  const securityItems = [
    {
      id: 'password',
      label: 'Alterar Senha',
      subtitle: 'Atualize sua senha regularmente',
      route: 'SettingsChangePassword',
    },
    {
      id: '2fa',
      label: 'AutenticaÃ§Ã£o 2FA',
      subtitle: 'Aplicativo autenticador',
      route: 'Settings2FA',
    },
    {
      id: 'devices',
      label: 'Dispositivos',
      subtitle: 'Gerenciar dispositivos conectados',
      route: 'SettingsDevices',
    },
    {
      id: 'access-history',
      label: 'HistÃ³rico de Acessos',
      subtitle: 'Acessos recentes Ã  sua conta',
      route: 'SettingsAccessHistory',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.backButton}>
            <Text style={styles.backIcon}>â†</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SeguranÃ§a</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {securityItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.item}
            onPress={() => navigation.push(item.route)}
          >
            <View style={styles.itemInfo}>
              <Text style={styles.itemLabel}>{item.label}</Text>
              <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
            </View>
            <Text style={styles.chevron}>â€º</Text>
          </TouchableOpacity>
        ))}

        {/* Alert Toggle */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>NotificaÃ§Ãµes de SeguranÃ§a</Text>
          </View>
          <View style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemLabel}>Alerta de novo acesso</Text>
              <Text style={styles.itemSubtitle}>Notifique quando alguÃ©m acessar sua conta</Text>
            </View>
            <View style={styles.toggleDisabled}>
              <View style={styles.toggleSwitch} />
            </View>
          </View>
          <View style={styles.warningText}>
            <Text style={styles.warningTextContent}>
              NÃ£o pode ser desativado por policy de seguranÃ§a
            </Text>
          </View>
        </View>
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
  headerSpacer: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing.md,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  itemInfo: {
    flex: 1,
  },
  itemLabel: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  itemSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  chevron: {
    fontSize: 16,
    color: colors.textTertiary,
    marginLeft: spacing.md,
  },
  toggleDisabled: {
    width: 38,
    height: 21,
    borderRadius: 11,
    backgroundColor: colors.primary,
    opacity: 0.5,
    justifyContent: 'center',
  },
  toggleSwitch: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: colors.text,
    marginLeft: 19,
  },
  warningText: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  warningTextContent: {
    fontSize: fontSize.xs,
    color: '#E74C3C',
    fontWeight: '700',
  },
});
